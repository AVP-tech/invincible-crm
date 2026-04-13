import { JobStatus, JobType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ingestWhatsappWebhook, syncEmailConnection } from "@/features/integrations/service";

export async function listBackgroundJobs(workspaceId: string) {
  return db.backgroundJob.findMany({
    where: {
      workspaceId
    },
    include: {
      integrationConnection: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 20
  });
}

export async function getBackgroundJob(workspaceId: string, jobId: string) {
  return db.backgroundJob.findFirst({
    where: {
      id: jobId,
      workspaceId
    },
    include: {
      integrationConnection: true
    }
  });
}

export async function enqueueBackgroundJob(
  workspaceId: string,
  type: JobType,
  payload: Prisma.InputJsonValue,
  integrationConnectionId?: string
) {
  const job = await db.backgroundJob.create({
    data: {
      workspaceId,
      integrationConnectionId,
      type,
      payload
    }
  });

  if (process.env.RUN_JOBS_INLINE !== "false") {
    return (await processBackgroundJob(job.id)) ?? job;
  }

  return job;
}

export async function processBackgroundJob(jobId: string) {
  const job = await db.backgroundJob.findUnique({
    where: {
      id: jobId
    }
  });

  if (!job || job.status === JobStatus.RUNNING) {
    return null;
  }

  await db.backgroundJob.update({
    where: {
      id: job.id
    },
    data: {
      status: JobStatus.RUNNING,
      startedAt: new Date(),
      attempts: {
        increment: 1
      }
    }
  });

  try {
    switch (job.type) {
      case JobType.SYNC_EMAIL:
        await syncEmailConnection((job.payload as { connectionId: string }).connectionId);
        break;
      case JobType.PROCESS_WHATSAPP:
        await ingestWhatsappWebhook(job.payload as object);
        break;
      case JobType.SYNC_SPREADSHEET:
      case JobType.RUN_AUTOMATION:
        break;
    }

    return db.backgroundJob.update({
      where: {
        id: job.id
      },
      data: {
        status: JobStatus.SUCCEEDED,
        finishedAt: new Date(),
        lastError: null
      }
    });
  } catch (error) {
    return db.backgroundJob.update({
      where: {
        id: job.id
      },
      data: {
        status: JobStatus.FAILED,
        finishedAt: new Date(),
        lastError: error instanceof Error ? error.message : "Job failed"
      }
    });
  }
}

export async function processDueJobs(limit = 10, workspaceId?: string) {
  const jobs = await db.backgroundJob.findMany({
    where: {
      ...(workspaceId ? { workspaceId } : {}),
      status: JobStatus.QUEUED,
      scheduledFor: {
        lte: new Date()
      }
    },
    orderBy: {
      scheduledFor: "asc"
    },
    take: limit
  });

  for (const job of jobs) {
    await processBackgroundJob(job.id);
  }

  return jobs.length;
}
