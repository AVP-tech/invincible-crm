import { NextResponse } from "next/server";
import { IntegrationProvider, JobStatus, JobType } from "@prisma/client";
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

    const job = await enqueueBackgroundJob(
      user.workspaceId,
      JobType.SYNC_EMAIL,
      { connectionId: connection.id },
      connection.id
    );

    if (job.status === JobStatus.FAILED) {
      return jsonError(job.lastError || "Failed to sync email", 500);
    }

    const finalConnectionStatus = await getIntegrationConnection(user.workspaceId, IntegrationProvider.EMAIL_IMAP);
    let syncedCount: number | null = null;

    if (job.status === JobStatus.SUCCEEDED) {
      const match = finalConnectionStatus?.lastSyncMessage?.match(/Synced (\d+)/);
      syncedCount = match?.[1] ? parseInt(match[1], 10) : 0;
    }

    return NextResponse.json({
      ok: true,
      syncedCount,
      job,
      lastSyncMessage: finalConnectionStatus?.lastSyncMessage ?? null,
    });
  } catch (error: any) {
    return jsonError(error?.message || "Failed to trigger email sync", 500);
  }
}
