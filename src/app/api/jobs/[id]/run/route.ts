import { JobStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { canManageWorkspace, getApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getBackgroundJob, processBackgroundJob } from "@/features/jobs/service";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canManageWorkspace(user)) {
    return jsonError("You do not have permission to run jobs", 403);
  }

  const { id } = await context.params;
  const job = await getBackgroundJob(user.workspaceId, id);

  if (!job) {
    return jsonError("Job not found", 404);
  }

  if (job.status === JobStatus.RUNNING) {
    return jsonError("This job is already running", 409);
  }

  const processedJob = await processBackgroundJob(job.id);

  if (!processedJob) {
    return jsonError("Could not run job", 500);
  }

  if (processedJob.status === JobStatus.FAILED) {
    return jsonError(processedJob.lastError ?? "Job failed", 500);
  }

  return NextResponse.json({ ok: true, job: processedJob });
}
