import { NextResponse } from "next/server";
import {
  findWhatsappIntegrationByPhoneNumberId,
} from "@/features/integrations/service";
import { enqueueBackgroundJob } from "@/features/jobs/service";
import { JobType, Prisma } from "@prisma/client";
import { env } from "@/lib/env";
import { verifyWhatsappWebhookSignature } from "@/features/integrations/meta-webhook";

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

  if (mode !== "subscribe" || !challenge) {
    return plainTextResponse("Bad Request", 400);
  }

  if (!env.whatsappWebhookVerifyToken || token !== env.whatsappWebhookVerifyToken) {
    return plainTextResponse("Forbidden", 403);
  }

  // Meta expects ONLY the challenge string as plain text for webhook verification.
  return plainTextResponse(challenge, 200);
}

// Processing Webhooks (Meta pushes live message payloads here)
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    if (env.whatsappAppSecret) {
      const signature = request.headers.get("x-hub-signature-256");

      if (!verifyWhatsappWebhookSignature(rawBody, signature, env.whatsappAppSecret)) {
        return new NextResponse("Invalid signature", { status: 401 });
      }
    } else if (process.env.NODE_ENV === "production") {
      return new NextResponse("Webhook secret not configured", { status: 500 });
    }

    const payload = JSON.parse(rawBody) as {
      object?: string;
      entry?: Array<{
        changes?: Array<{
          value?: {
            metadata?: {
              phone_number_id?: string;
            };
            messages?: unknown[];
          };
        }>;
      }>;
    };

    if (!payload.object || payload.object !== 'whatsapp_business_account') {
      return new NextResponse("Invalid Payload Object", { status: 404 });
    }

    let processedAny = false;
    const queuedConnectionIds = new Set<string>();

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change?.value?.messages) {
          const phoneNumberId = change.value.metadata?.phone_number_id;

          if (phoneNumberId) {
            const connection = await findWhatsappIntegrationByPhoneNumberId(phoneNumberId);
            
            if (connection && !queuedConnectionIds.has(connection.id)) {
               await enqueueBackgroundJob(
                 connection.workspaceId, 
                 JobType.PROCESS_WHATSAPP, 
                 payload as Prisma.InputJsonValue,
                 connection.id
               );
               queuedConnectionIds.add(connection.id);
               processedAny = true;
            }
          }
        }
      }
    }

    if (processedAny) {
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
       return new NextResponse("NO_MATCHING_CONNECTION", { status: 200 });
    }

  } catch (err) {
    return new NextResponse("Webhook Processing Failed", { status: 500 });
  }
}
