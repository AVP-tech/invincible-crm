import { NextResponse } from "next/server";
import {
  findWhatsappIntegrationByVerifyToken,
  findWhatsappIntegrationByPhoneNumberId,
  markWhatsappIntegrationVerified,
} from "@/features/integrations/service";
import { enqueueBackgroundJob } from "@/features/jobs/service";
import { JobType, Prisma } from "@prisma/client";
import { env } from "@/lib/env";
import { verifyWhatsappWebhookSignature } from "@/features/integrations/meta-webhook";

// Webhook Verification (Meta requires this when configuring the URL)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token) {
    // First: check env variable directly (for initial setup)
    const envVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    if (envVerifyToken && token === envVerifyToken) {
      return new NextResponse(challenge, { status: 200 });
    }

    // Second: check database for per-connection verify tokens
    const connection = await findWhatsappIntegrationByVerifyToken(token);
    
    if (connection) {
      await markWhatsappIntegrationVerified(connection.id);
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return new NextResponse("Bad Request", { status: 400 });
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
      // Allow without signature in production if no app secret is set
      // (remove this once WHATSAPP_APP_SECRET is configured)
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
