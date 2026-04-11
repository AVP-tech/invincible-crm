import { NextResponse } from "next/server";
import {
  findWhatsappIntegrationByVerifyToken,
  findWhatsappIntegrationByPhoneNumberId,
  markWhatsappIntegrationVerified,
} from "@/features/integrations/service";
import { enqueueBackgroundJob } from "@/features/jobs/service";
import { JobType } from "@prisma/client";

// Webhook Verification (Meta requires this when configuring the URL)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token) {
    // Verify against our database connections
    const connection = await findWhatsappIntegrationByVerifyToken(token);
    
    if (connection) {
      await markWhatsappIntegrationVerified(connection.id);
      // The token matches! Meta expects ONLY the challenge string to be returned as plain text.
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
    const payload = await request.json();

    // Verify it's a WhatsApp API webhook payload by checking the object structure
    if (!payload.object || payload.object !== 'whatsapp_business_account') {
      return new NextResponse("Invalid Payload Object", { status: 404 });
    }

    let processedAny = false;

    // Fast-track: find the phone number ID so we can assign the payload to the correct workspace
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change?.value?.messages) {
          const phoneNumberId = change.value.metadata?.phone_number_id;

          if (phoneNumberId) {
            const connection = await findWhatsappIntegrationByPhoneNumberId(phoneNumberId);
            
            if (connection) {
               // Enqueue the incoming webhook payload safely into our Background Job queue
               await enqueueBackgroundJob(
                 connection.workspaceId, 
                 JobType.PROCESS_WHATSAPP, 
                 payload, 
                 connection.id
               );
               processedAny = true;
            }
          }
        }
      }
    }

    if (processedAny) {
      // Meta just expects a 200 response to acknowledge receipt. 
      // Background worker handles actual ingestion asynchronously.
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
       // Acknowledge anyway so Meta doesn't retry indefinitely for an unlinked number.
       return new NextResponse("NO_MATCHING_CONNECTION", { status: 200 });
    }

  } catch (err) {
    // Return 500 so Meta automatically retries if our server is failing
    return new NextResponse("Webhook Processing Failed", { status: 500 });
  }
}
