import { NextResponse } from "next/server";
import { IntegrationProvider, JobType } from "@prisma/client";
import { getApiUser, canManageWorkspace } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getIntegrationConnection } from "@/features/integrations/service";
import { enqueueBackgroundJob } from "@/features/jobs/service";

export async function POST() {
  try {
    const user = await getApiUser();
    if (!user) {
      return jsonError("Unauthorized", 401);
    }
    
    if (!canManageWorkspace(user)) {
      return jsonError("Only workspace managers can trigger global integration syncs.", 403);
    }

    const connection = await getIntegrationConnection(user.workspaceId, IntegrationProvider.EMAIL_IMAP);
    if (!connection) {
      return jsonError("Email integration is not configured. Please save credentials first.", 404);
    }

    // Since processBackgroundJob in service handles running the job if RUN_JOBS_INLINE !== "false",
    // enqueuing this job will automatically sink emails internally and wait for it!
    const job = await enqueueBackgroundJob(
      user.workspaceId,
      JobType.SYNC_EMAIL,
      { connectionId: connection.id },
      connection.id
    );

    // If it ran inline, let's fetch the connection sync data updated by the process
    const finalConnectionStatus = await getIntegrationConnection(user.workspaceId, IntegrationProvider.EMAIL_IMAP);
    
    // Attempt to extract the number of synced emails from lastSyncMessage ("Synced 5 new email message(s)")
    let syncedCount = 0;
    const match = finalConnectionStatus?.lastSyncMessage?.match(/Synced (\d+)/);
    if (match && match[1]) {
      syncedCount = parseInt(match[1], 10);
    }

    return NextResponse.json({ ok: true, syncedCount, job });
  } catch (error: any) {
    return jsonError(error?.message || "Failed to trigger email sync", 500);
  }
}
