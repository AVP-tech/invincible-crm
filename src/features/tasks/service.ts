import { ActivityType, TaskPriority, TaskRecurrencePattern, TaskStatus } from "@prisma/client";
import { nanoid } from "nanoid";
import { isToday, startOfDay } from "date-fns";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { type TaskInput } from "@/lib/schemas";
import { serializeDateInput } from "@/lib/utils";
import { formatTaskRecurrence, getNextRecurringDueDate, isRecurringPattern } from "@/features/tasks/recurrence";
import { getWorkspaceByOwnerUserId } from "@/lib/workspace";
import { runAutomationTrigger } from "@/features/automations/service";

export type TaskFilter = "all" | "today" | "overdue" | "recurring" | "completed";

export type TaskMutationResult = {
  task: NonNullable<Awaited<ReturnType<typeof getTaskWithRelations>>>;
  spawnedTask: NonNullable<Awaited<ReturnType<typeof getTaskWithRelations>>> | null;
};

async function getTaskWithRelations(taskId: string) {
  return db.task.findUnique({
    where: { id: taskId },
    include: {
      contact: true,
      deal: true,
      assignee: true
    }
  });
}

function buildRecurrenceData(input: TaskInput, existing?: { recurrenceSeriesId: string | null }) {
  const recurrencePattern = input.recurrencePattern ?? TaskRecurrencePattern.NONE;
  const recurrenceIntervalDays =
    recurrencePattern === TaskRecurrencePattern.CUSTOM_DAYS ? input.recurrenceIntervalDays ?? null : null;
  const recurrenceSeriesId =
    recurrencePattern === TaskRecurrencePattern.NONE ? null : existing?.recurrenceSeriesId ?? nanoid(12);

  return {
    recurrencePattern,
    recurrenceIntervalDays,
    recurrenceSeriesId
  };
}

function getDueDateValue(value?: string | null) {
  return value ? new Date(serializeDateInput(value)!) : null;
}

export async function listTasks(userId: string, filter: TaskFilter = "all") {
  const today = startOfDay(new Date());

  return db.task.findMany({
    where: {
      userId,
      ...(filter === "today" && {
        dueDate: {
          gte: today,
          lt: new Date(today.getTime() + 1000 * 60 * 60 * 24)
        },
        status: TaskStatus.OPEN
      }),
      ...(filter === "overdue" && {
        dueDate: {
          lt: today
        },
        status: TaskStatus.OPEN
      }),
      ...(filter === "recurring" && {
        recurrencePattern: {
          not: TaskRecurrencePattern.NONE
        }
      }),
      ...(filter === "completed" && {
        status: TaskStatus.COMPLETED
      })
    },
    include: {
      contact: true,
      deal: true,
      assignee: true
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { updatedAt: "desc" }]
  });
}

export async function createTask(userId: string, input: TaskInput) {
  const recurrence = buildRecurrenceData(input);
  const dueDate = getDueDateValue(input.dueDate);

  const task = await db.task.create({
    data: {
      userId,
      title: input.title,
      description: input.description,
      contactId: input.contactId,
      dealId: input.dealId,
      assignedToUserId: input.assignedToUserId,
      dueDate: dueDate ?? undefined,
      priority: input.priority,
      recurrencePattern: recurrence.recurrencePattern,
      recurrenceIntervalDays: recurrence.recurrenceIntervalDays,
      recurrenceSeriesId: recurrence.recurrenceSeriesId
    },
    include: {
      contact: true,
      deal: true,
      assignee: true
    }
  });

  await logActivity({
    userId,
    type: ActivityType.TASK_CREATED,
    title: `Created task: ${task.title}`,
    description:
      [
        task.dueDate ? `Due ${isToday(task.dueDate) ? "today" : task.dueDate.toDateString()}` : null,
        formatTaskRecurrence(task.recurrencePattern, task.recurrenceIntervalDays)
      ]
        .filter(Boolean)
        .join(" • ") || undefined,
    entityType: "task",
    entityId: task.id,
    contactId: task.contactId,
    dealId: task.dealId,
    taskId: task.id
  });

  return task;
}

export async function updateTask(userId: string, taskId: string, input: TaskInput): Promise<TaskMutationResult | null> {
  const existing = await db.task.findFirst({
    where: {
      id: taskId,
      userId
    }
  });

  if (!existing) {
    return null;
  }

  const recurrence = buildRecurrenceData(input, existing);
  const dueDate = getDueDateValue(input.dueDate);

  const task = await db.task.update({
    where: { id: taskId },
    data: {
      title: input.title,
      description: input.description,
      contactId: input.contactId,
      dealId: input.dealId,
      assignedToUserId: input.assignedToUserId,
      dueDate,
      priority: input.priority,
      status: input.status,
      recurrencePattern: recurrence.recurrencePattern,
      recurrenceIntervalDays: recurrence.recurrenceIntervalDays,
      recurrenceSeriesId: recurrence.recurrenceSeriesId,
      completedAt: input.status === TaskStatus.COMPLETED ? new Date() : null
    },
    include: {
      contact: true,
      deal: true,
      assignee: true
    }
  });

  let spawnedTask = null;

  if (existing.status !== TaskStatus.COMPLETED && task.status === TaskStatus.COMPLETED && isRecurringPattern(task.recurrencePattern) && task.dueDate) {
    const alreadyScheduled = await db.task.findFirst({
      where: {
        userId,
        recurrenceSeriesId: task.recurrenceSeriesId ?? undefined,
        status: TaskStatus.OPEN,
        dueDate: {
          gt: task.dueDate
        }
      },
      orderBy: {
        dueDate: "asc"
      }
    });

    if (!alreadyScheduled) {
      const nextDueDate = getNextRecurringDueDate(task.dueDate, task.recurrencePattern, task.recurrenceIntervalDays);

      if (nextDueDate) {
        spawnedTask = await db.task.create({
          data: {
            userId,
            title: task.title,
            description: task.description,
            contactId: task.contactId,
            dealId: task.dealId,
            assignedToUserId: task.assignedToUserId,
            dueDate: nextDueDate,
            priority: task.priority,
            recurrencePattern: task.recurrencePattern,
            recurrenceIntervalDays: task.recurrenceIntervalDays,
            recurrenceSeriesId: task.recurrenceSeriesId
          },
          include: {
            contact: true,
            deal: true,
            assignee: true
          }
        });

        await logActivity({
          userId,
          type: ActivityType.TASK_RECURRING_SCHEDULED,
          title: `Scheduled next recurring task: ${spawnedTask.title}`,
          description: spawnedTask.dueDate ? `Due ${spawnedTask.dueDate.toDateString()}` : undefined,
          entityType: "task",
          entityId: spawnedTask.id,
          contactId: spawnedTask.contactId,
          dealId: spawnedTask.dealId,
          taskId: spawnedTask.id
        });
      }
    }
  }

  await logActivity({
    userId,
    type: task.status === TaskStatus.COMPLETED ? ActivityType.TASK_COMPLETED : ActivityType.TASK_UPDATED,
    title: `${task.status === TaskStatus.COMPLETED ? "Completed" : "Updated"} task: ${task.title}`,
    description: spawnedTask ? `Next recurring follow-up scheduled for ${spawnedTask.dueDate?.toDateString()}` : undefined,
    entityType: "task",
    entityId: task.id,
    contactId: task.contactId,
    dealId: task.dealId,
    taskId: task.id
  });

  if (task.status === TaskStatus.COMPLETED) {
    const workspace = await getWorkspaceByOwnerUserId(userId);

    if (workspace) {
      await runAutomationTrigger({
        workspaceId: workspace.id,
        workspaceOwnerId: userId,
        triggerType: "TASK_COMPLETED",
        task: {
          id: task.id,
          title: task.title,
          contactId: task.contactId,
          dealId: task.dealId,
          assignedToUserId: task.assignedToUserId
        },
        contact: task.contact
          ? {
              id: task.contact.id,
              name: task.contact.name
            }
          : undefined
      });
    }
  }

  return {
    task,
    spawnedTask
  };
}

export async function quickToggleTask(userId: string, taskId: string) {
  const existing = await db.task.findFirst({
    where: {
      id: taskId,
      userId
    }
  });

  if (!existing) return null;

  const status = existing.status === TaskStatus.OPEN ? TaskStatus.COMPLETED : TaskStatus.OPEN;

  return updateTask(userId, taskId, {
    title: existing.title,
    description: existing.description ?? undefined,
    contactId: existing.contactId ?? undefined,
    dealId: existing.dealId ?? undefined,
    assignedToUserId: existing.assignedToUserId ?? undefined,
    dueDate: existing.dueDate ? existing.dueDate.toISOString().slice(0, 10) : undefined,
    priority: existing.priority ?? TaskPriority.MEDIUM,
    status,
    recurrencePattern: existing.recurrencePattern,
    recurrenceIntervalDays: existing.recurrenceIntervalDays ?? undefined
  });
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await db.task.findFirst({
    where: {
      id: taskId,
      userId
    }
  });

  if (!task) return null;

  await db.task.delete({
    where: { id: taskId }
  });

  await logActivity({
    userId,
    type: ActivityType.TASK_DELETED,
    title: `Removed task: ${task.title}`,
    entityType: "task",
    entityId: taskId,
    contactId: task.contactId,
    dealId: task.dealId
  });

  return task;
}
