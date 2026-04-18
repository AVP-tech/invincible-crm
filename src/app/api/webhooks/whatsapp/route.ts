import { after, NextResponse } from "next/server";
import {
  findWhatsappIntegrationByPhoneNumberId,
} from "@/features/integrations/service";
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
          wa_id?: string;
        }>;
        messages?: Array<{
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

async function sendWhatsappAutoReply(senderPhone: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    logger.warn("WhatsApp auto-reply skipped because Cloud API credentials are missing.", {
      senderPhone,
      hasPhoneNumberId: Boolean(phoneNumberId),
      hasAccessToken: Boolean(accessToken)
    });
    return;
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
        text: {
          body: "Hello from Invincible CRM 🚀"
        }
      })
    });

    if (!response.ok) {
      logger.warn("WhatsApp auto-reply failed.", {
        senderPhone,
        status: response.status,
        responseBody: await response.text()
      });
      return;
    }

    logger.info("WhatsApp auto-reply sent.", {
      senderPhone
    });
  } catch (error) {
    logger.warn("WhatsApp auto-reply request failed.", {
      senderPhone,
      error: error instanceof Error ? error.message : "Unknown error"
    });
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
    const senderPhone = firstMessage?.from ?? firstValue?.contacts?.[0]?.wa_id ?? "unknown";
    const messageText = firstMessage?.text?.body ?? "[no text body]";

    logger.info("WhatsApp message received.", {
      phoneNumberId: firstValue?.metadata?.phone_number_id,
      senderPhone,
      messageText
    });

    // Acknowledge Meta immediately, then send the reply and queue follow-up work.
    after(async () => {
      if (firstMessage?.from) {
        await sendWhatsappAutoReply(firstMessage.from);
      } else {
        logger.info("WhatsApp auto-reply skipped because no inbound message was available.", {
          senderPhone
        });
      }

      await enqueueWhatsappProcessing(payload);
    });
  } catch (error) {
    logger.warn("WhatsApp webhook received an invalid JSON payload, but the webhook was acknowledged.", {
      error: error instanceof Error ? error.message : "Unknown error",
      body: rawBody
    });
  }

  return plainTextResponse("EVENT_RECEIVED", 200);
}
