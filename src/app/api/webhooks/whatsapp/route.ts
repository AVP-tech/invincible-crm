import { NextResponse } from "next/server";
import {
  findWhatsappIntegrationByPhoneNumberId,
} from "@/features/integrations/service";
import { enqueueBackgroundJob } from "@/features/jobs/service";
import { JobType, Prisma } from "@prisma/client";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

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

// Processing Webhooks (Meta pushes live message payloads here)
export async function POST(request: Request) {
  const rawBody = await request.text();
  logger.info("WhatsApp webhook received.", {
    body: rawBody
  });

  try {
    const payload = JSON.parse(rawBody) as {
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

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const phoneNumberId = change.value?.metadata?.phone_number_id;

        for (const message of change.value?.messages || []) {
          const senderPhone = message.from ?? change.value?.contacts?.[0]?.wa_id ?? "unknown";
          const messageText = message.text?.body ?? "[non-text message]";

          logger.info("WhatsApp message received.", {
            phoneNumberId,
            senderPhone,
            messageText
          });
        }
      }
    }

    // Best-effort downstream processing; do not fail the webhook if any DB/job work breaks.
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
  } catch (error) {
    logger.warn("WhatsApp webhook received an invalid JSON payload, but the webhook was acknowledged.", {
      error: error instanceof Error ? error.message : "Unknown error",
      body: rawBody
    });
  }

  return plainTextResponse("EVENT_RECEIVED", 200);
}
