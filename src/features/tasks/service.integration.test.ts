import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient, TaskStatus } from "@prisma/client";
import { createTask, quickToggleTask } from "@/features/tasks/service";

const prisma = new PrismaClient();

async function resetDatabase() {
  await prisma.activity.deleteMany();
  await prisma.conversationLog.deleteMany();
  await prisma.backgroundJob.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.parsedCapture.deleteMany();
  await prisma.automationRule.deleteMany();
  await prisma.integrationConnection.deleteMany();
  await prisma.workspaceMembership.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

describe("recurring task scheduling", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("creates the next follow-up automatically when a recurring task is completed", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Recurring User",
        email: "recurring@example.com",
        passwordHash: "hashed"
      }
    });
    const workspace = await prisma.workspace.create({
      data: {
        ownerUserId: user.id,
        name: "Recurring Workspace"
      }
    });

    await prisma.workspaceMembership.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "OWNER"
      }
    });

    const contact = await prisma.contact.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        name: "Rahul Verma"
      }
    });

    const task = await createTask(workspace.id, user.id, {
      title: "Weekly client follow-up",
      description: "Share progress and keep the deal warm",
      contactId: contact.id,
      dueDate: "2026-04-10",
      priority: "HIGH",
      status: "OPEN",
      recurrencePattern: "WEEKLY",
      recurrenceIntervalDays: undefined
    });

    const result = await quickToggleTask(workspace.id, user.id, task.id);
    const tasks = await prisma.task.findMany({
      where: {
        workspaceId: workspace.id
      },
      orderBy: {
        dueDate: "asc"
      }
    });
    const recurringActivity = await prisma.activity.findFirst({
      where: {
        workspaceId: workspace.id,
        type: "TASK_RECURRING_SCHEDULED"
      }
    });

    expect(result?.task.status).toBe(TaskStatus.COMPLETED);
    expect(result?.spawnedTask).toBeTruthy();
    expect(tasks).toHaveLength(2);
    expect(tasks[0]?.status).toBe(TaskStatus.COMPLETED);
    expect(tasks[1]?.status).toBe(TaskStatus.OPEN);
    expect(tasks[1]?.dueDate?.toISOString().slice(0, 10)).toBe("2026-04-17");
    expect(tasks[0]?.recurrenceSeriesId).toBe(tasks[1]?.recurrenceSeriesId);
    expect(recurringActivity).toBeTruthy();
  });
});
