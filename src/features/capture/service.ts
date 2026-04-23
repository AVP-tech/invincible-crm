import { ActivityType, CaptureStatus, ParserMode, Prisma, TaskRecurrencePattern, TaskStatus } from "@prisma/client";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { resolveRelativeDate } from "@/lib/date-parser";
import { type CapturePreview } from "@/lib/schemas";

type ApplyCaptureOptions = {
  noteSource?: string;
  captureTitle?: string;
  captureDescription?: string;
  contactActivityTitle?: string;
  dealActivityTitle?: string;
  taskActivityTitle?: string;
  noteActivityTitle?: string;
};

async function resolveCompany(tx: Prisma.TransactionClient, workspaceId: string, userId: string, companyName?: string) {
  if (!companyName) return null;

  return tx.company.upsert({
    where: {
      workspaceId_name: {
        workspaceId,
        name: companyName
      }
    },
    update: {},
    create: {
      userId,
      workspaceId,
      name: companyName
    }
  });
}

function resolveCaptureDate(value: string | undefined, fieldLabel: string, baseDate: Date) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsedDate = new Date(value);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  const relativeDate = resolveRelativeDate(value, baseDate);

  if (relativeDate.date) {
    return relativeDate.date;
  }

  throw new Error(`We couldn't understand the ${fieldLabel}. Try a specific time or use morning, afternoon, or evening.`);
}

export async function applyCapturePreview(
  workspaceId: string,
  userId: string,
  input: string,
  preview: CapturePreview,
  options: ApplyCaptureOptions = {}
) {
  const referenceDate = new Date();
  const expectedCloseDate = resolveCaptureDate(preview.deal?.expectedCloseDate, "deal date", referenceDate);
  const taskDueDate = resolveCaptureDate(preview.task?.dueDate, "task date", referenceDate);

  const result = await db.$transaction(async (tx) => {
    const parsedCapture = await tx.parsedCapture.create({
      data: {
        userId,
        workspaceId,
        inputText: input,
        status: CaptureStatus.APPLIED,
        parserMode: preview.parserMode === "AI" ? ParserMode.AI : ParserMode.FALLBACK,
        confidence: preview.confidence,
        appliedAt: new Date(),
        parsedPayload: preview
      }
    });

    let contactId = preview.existingContactId ?? null;
    let dealId = preview.existingDealId ?? null;
    let noteId: string | null = null;
    let taskId: string | null = null;

    if (preview.contact?.name) {
      const company = await resolveCompany(tx, workspaceId, userId, preview.contact.companyName ?? undefined);

      if (contactId) {
        await tx.contact.update({
          where: { id: contactId },
          data: {
            name: preview.contact.name,
            email: preview.contact.email ?? undefined,
            phone: preview.contact.phone ?? undefined,
            source: preview.contact.source ?? undefined,
            companyId: company?.id ?? undefined,
            tags: preview.contact.tags
          }
        });
      } else {
        const contact = await tx.contact.create({
          data: {
            userId,
            workspaceId,
            name: preview.contact.name,
            email: preview.contact.email ?? undefined,
            phone: preview.contact.phone ?? undefined,
            source: preview.contact.source ?? "Quick Capture",
            companyId: company?.id,
            tags: preview.contact.tags
          }
        });

        contactId = contact.id;
      }
    }

    if (preview.deal?.title) {
      const company = await resolveCompany(tx, workspaceId, userId, preview.contact?.companyName ?? undefined);

      if (dealId) {
        await tx.deal.update({
          where: { id: dealId },
          data: {
            title: preview.deal.title,
            description: preview.deal.description ?? undefined,
            stage: preview.deal.stage,
            amount: preview.deal.amount ?? undefined,
            currency: preview.deal.currency,
            expectedCloseDate,
            nextStep: preview.deal.nextStep ?? undefined,
            contactId: contactId ?? undefined,
            companyId: company?.id ?? undefined
          }
        });
      } else {
        const deal = await tx.deal.create({
          data: {
            userId,
            workspaceId,
            contactId: contactId ?? undefined,
            companyId: company?.id,
            title: preview.deal.title,
            description: preview.deal.description ?? undefined,
            stage: preview.deal.stage,
            amount: preview.deal.amount ?? undefined,
            currency: preview.deal.currency,
            expectedCloseDate,
            nextStep: preview.deal.nextStep ?? undefined
          }
        });

        dealId = deal.id;
      }
    }

    if (preview.task?.title) {
      const existingTask = await tx.task.findFirst({
        where: {
          workspaceId,
          title: preview.task.title,
          status: TaskStatus.OPEN,
          contactId: contactId ?? undefined
        }
      });

      if (existingTask) {
        const task = await tx.task.update({
          where: { id: existingTask.id },
          data: {
            description: preview.task.description ?? undefined,
            dueDate: taskDueDate,
            priority: preview.task.priority,
            contactId: contactId ?? undefined,
            dealId: dealId ?? undefined
          }
        });

        taskId = task.id;
      } else {
        const task = await tx.task.create({
          data: {
            userId,
            workspaceId,
            title: preview.task.title,
            description: preview.task.description ?? undefined,
            dueDate: taskDueDate,
            priority: preview.task.priority,
            recurrencePattern: preview.task.recurrencePattern ?? TaskRecurrencePattern.NONE,
            recurrenceIntervalDays:
              preview.task.recurrencePattern === TaskRecurrencePattern.CUSTOM_DAYS ? preview.task.recurrenceIntervalDays ?? undefined : undefined,
            recurrenceSeriesId:
              preview.task.recurrencePattern && preview.task.recurrencePattern !== TaskRecurrencePattern.NONE ? nanoid(12) : undefined,
            contactId: contactId ?? undefined,
            dealId: dealId ?? undefined
          }
        });

        taskId = task.id;
      }
    }

    if (preview.note) {
      const note = await tx.note.create({
        data: {
          userId,
          workspaceId,
          contactId: contactId ?? undefined,
          dealId: dealId ?? undefined,
          content: preview.note,
          source: options.noteSource ?? "quick_capture"
        }
      });

      noteId = note.id;
    }

    return {
      parsedCapture,
      contactId,
      dealId,
      taskId,
      noteId
    };
  });

  await logActivity({
    userId,
    workspaceId,
    type: ActivityType.CAPTURE_APPLIED,
    title: options.captureTitle ?? "Quick capture applied",
    description: options.captureDescription ?? preview.summary,
    entityType: "capture",
    entityId: result.parsedCapture.id,
    contactId: result.contactId,
    dealId: result.dealId,
    taskId: result.taskId,
    noteId: result.noteId,
    metadata: preview
  });

  if (result.contactId) {
    await logActivity({
      userId,
      workspaceId,
      type: preview.existingContactId ? ActivityType.CONTACT_UPDATED : ActivityType.CONTACT_CREATED,
      title:
        options.contactActivityTitle ??
        (preview.existingContactId ? "Updated contact via quick capture" : "Created contact via quick capture"),
      entityType: "contact",
      entityId: result.contactId,
      contactId: result.contactId
    });
  }

  if (result.dealId) {
    await logActivity({
      userId,
      workspaceId,
      type: preview.existingDealId ? ActivityType.DEAL_UPDATED : ActivityType.DEAL_CREATED,
      title: options.dealActivityTitle ?? (preview.existingDealId ? "Updated deal via quick capture" : "Created deal via quick capture"),
      entityType: "deal",
      entityId: result.dealId,
      contactId: result.contactId,
      dealId: result.dealId
    });
  }

  if (result.taskId) {
    await logActivity({
      userId,
      workspaceId,
      type: ActivityType.TASK_CREATED,
      title: options.taskActivityTitle ?? "Created task via quick capture",
      entityType: "task",
      entityId: result.taskId,
      contactId: result.contactId,
      dealId: result.dealId,
      taskId: result.taskId
    });
  }

  if (result.noteId) {
    await logActivity({
      userId,
      workspaceId,
      type: ActivityType.NOTE_ADDED,
      title: options.noteActivityTitle ?? "Added note via quick capture",
      entityType: "note",
      entityId: result.noteId,
      contactId: result.contactId,
      dealId: result.dealId,
      noteId: result.noteId
    });
  }

  return result;
}
