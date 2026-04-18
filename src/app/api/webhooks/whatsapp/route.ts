import { after, NextResponse } from "next/server";
import {
  findWhatsappIntegrationByPhoneNumberId,
} from "@/features/integrations/service";
import { saveWhatsappMessageToCrm, saveWhatsappBotReplyToCrm } from "@/features/integrations/whatsapp-crm";
import { generateConversationalReply } from "@/features/integrations/whatsapp-ai";
import { enqueueBackgroundJob } from "@/features/jobs/service";
import { JobType, Prisma } from "@prisma/client";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

type WhatsappWebhookPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: {
          phone_number_id?: string;
        };
        contacts?: Array<{
          profile?: {
            name?: string;
          };
          wa_id?: string;
        }>;
        messages?: Array<{
          id?: string;
          type?: string;
          from?: string;
          text?: {
            body?: string;
          };
        }>;
      };
    }>;
  }>;
};

function plainTextResponse(body: string, status: number) {
  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}

// Webhook Verification (Meta requires this when configuring the URL)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !challenge || token !== env.whatsappWebhookVerifyToken) {
    return plainTextResponse("Forbidden", 403);
  }

  // Meta expects ONLY the challenge string as plain text for webhook verification.
  return plainTextResponse(challenge, 200);
}

async function sendWhatsappMessage(senderPhone: string, replyText: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    logger.warn("WhatsApp send skipped because Cloud API credentials are missing.", {
      senderPhone,
      hasPhoneNumberId: Boolean(phoneNumberId),
      hasAccessToken: Boolean(accessToken)
    });
    return false;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: senderPhone,
        text: { body: replyText }
      })
    });

    if (!response.ok) {
      logger.warn("WhatsApp message send failed.", {
        senderPhone,
        status: response.status,
        responseBody: await response.text()
      });
      return false;
    }

    logger.info("WhatsApp message sent.", { senderPhone });
    return true;
  } catch (error) {
    logger.warn("WhatsApp message send request failed.", {
      senderPhone,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return false;
  }
}

// Keep the existing downstream processing, but move it off the response path.
async function enqueueWhatsappProcessing(payload: WhatsappWebhookPayload) {
  try {
    const queuedConnectionIds = new Set<string>();

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const phoneNumberId = change.value?.metadata?.phone_number_id;

        if (!phoneNumberId || !(change.value?.messages?.length)) {
          continue;
        }

        const connection = await findWhatsappIntegrationByPhoneNumberId(phoneNumberId);

        if (connection && !queuedConnectionIds.has(connection.id)) {
          await enqueueBackgroundJob(
            connection.workspaceId,
            JobType.PROCESS_WHATSAPP,
            payload as Prisma.InputJsonValue,
            connection.id
          );
          queuedConnectionIds.add(connection.id);
        }
      }
    }
  } catch (error) {
    logger.warn("WhatsApp webhook downstream processing failed, but the webhook was acknowledged.", {
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

// Processing Webhooks (Meta pushes live message payloads here)
export async function POST(request: Request) {
  const rawBody = await request.text();
  logger.info("WhatsApp webhook received.", {
    body: rawBody
  });

  try {
    const payload = JSON.parse(rawBody) as WhatsappWebhookPayload;
    const firstValue = payload.entry?.[0]?.changes?.[0]?.value;
    const firstMessage = firstValue?.messages?.[0];
    const phoneNumberId = firstValue?.metadata?.phone_number_id;
    const senderPhone = firstMessage?.from ?? "unknown";
    const messageText = firstMessage?.text?.body ?? "[no text body]";
    const contactName =
      firstValue?.contacts?.find((contact) => contact.wa_id === firstMessage?.from)?.profile?.name ??
      firstValue?.contacts?.[0]?.profile?.name;
    const receivedAt = new Date();

    logger.info("New message received", {
      phoneNumberId,
      senderPhone,
      messageText,
      externalMessageId: firstMessage?.id
    });

    // Acknowledge Meta immediately, then process sequentially in background.
    after(async () => {
      // Always queue downstream CRM automation jobs.
      void enqueueWhatsappProcessing(payload);

      if (!firstMessage?.from || !phoneNumberId) {
        logger.info("WhatsApp AI flow skipped: no inbound message or phone number ID.", { senderPhone });
        return;
      }

      // Step 1: Save the inbound user message → get back the contactId.
      const crmResult = await saveWhatsappMessageToCrm({
        phoneNumberId,
        senderPhone: firstMessage.from,
        messageText,
        contactName,
        receivedAt
      });

      if (!crmResult?.contactId) {
        logger.warn("WhatsApp AI flow aborted: could not save message to CRM.", { senderPhone });
        return;
      }

      const { contactId } = crmResult;

      // Step 2: Generate an AI reply using the contact's stored conversation history as memory.
      const aiReply = await generateConversationalReply(contactId, messageText);
      const replyText = aiReply ?? "Thanks for reaching out! We'll get back to you shortly. 🙏";

      // Step 3: Send the reply over WhatsApp Cloud API.
      const sent = await sendWhatsappMessage(firstMessage.from, replyText);

      if (!sent) {
        logger.warn("WhatsApp AI reply could not be delivered.", { senderPhone, contactId });
        return;
      }

      // Step 4: Persist the bot's reply as a Note so the bot remembers it next turn.
      // We need the workspace & owner context — re-fetch via integration lookup.
      const connection = await findWhatsappIntegrationByPhoneNumberId(phoneNumberId);

      if (connection) {
        await saveWhatsappBotReplyToCrm({
          contactId,
          workspaceId: connection.workspaceId,
          ownerUserId: connection.workspace.ownerUserId,
          replyText,
          phoneNumberId,
          senderPhone: firstMessage.from
        });
      }
    });
  } catch (error) {
    logger.warn("WhatsApp webhook received an invalid JSON payload, but the webhook was acknowledged.", {
      error: error instanceof Error ? error.message : "Unknown error",
      body: rawBody
    });
  }

  return plainTextResponse("EVENT_RECEIVED", 200);
}
