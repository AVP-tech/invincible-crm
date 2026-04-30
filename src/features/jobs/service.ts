import { JobStatus, JobType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ingestWhatsappWebhook, syncEmailConnection, sendOutboundWhatsappMessage } from "@/features/integrations/service";
import { sendEmail } from "@/lib/email";

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
  integrationConnectionId?: string,
  scheduledFor?: Date
) {
  const job = await db.backgroundJob.create({
    data: {
      workspaceId,
      integrationConnectionId,
      type,
      payload,
      scheduledFor: scheduledFor ?? new Date()
    }
  });

  if (process.env.RUN_JOBS_INLINE !== "false" && (!scheduledFor || scheduledFor <= new Date())) {
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
      case JobType.SEND_TASK_REMINDER: {
        const payload = job.payload as { taskId: string };
        const task = await db.task.findUnique({
          where: { id: payload.taskId },
          include: { user: true, assignee: true, contact: true, deal: true }
        });
        
        if (!task || task.status === "COMPLETED") {
          break;
        }

        const targetUser = task.assignee || task.user;

        // 1. WhatsApp Notification
        if (targetUser.phone) {
          const whatsappConnection = await db.integrationConnection.findFirst({
            where: { workspaceId: job.workspaceId, provider: "WHATSAPP_META", status: "CONNECTED" }
          });

          if (whatsappConnection) {
            await sendOutboundWhatsappMessage(
              whatsappConnection.id,
              targetUser.phone,
              `⏰ Reminder: You have a task due - "${task.title}"`
            );
          }
        }

        // 2. Email Notification
        if (targetUser.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
          const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; padding: 30px; background-color: #fcfbf8; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0f172a; margin-top: 0;">Task Reminder ⏰</h2>
              <p style="color: #334155;">Hi ${targetUser.name},</p>
              <p style="color: #334155;">This is a quick reminder for your upcoming task:</p>
              <div style="background-color: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
                <strong style="font-size: 18px; color: #0f172a;">${task.title}</strong>
                ${task.description ? `<p style="color: #64748b; margin-top: 8px;">${task.description}</p>` : ""}
              </div>
              <p>
                <a href="${appUrl}/tasks" style="display:inline-block; padding: 12px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">View Task in CRM</a>
              </p>
            </div>
          `;
          
          await sendEmail({
            to: targetUser.email,
            subject: `Reminder: ${task.title}`,
            html
          });
        }
        break;
      }
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
