import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { applyCapturePreview } from "@/features/capture/service";
import { fallbackParseCapture } from "@/features/capture/parser";

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

describe("applyCapturePreview", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("creates a full crm trail from a mixed capture", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        passwordHash: "hashed"
      }
    });
    const workspace = await prisma.workspace.create({
      data: {
        ownerUserId: user.id,
        name: "Test Workspace"
      }
    });

    await prisma.workspaceMembership.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "OWNER"
      }
    });

    const preview = fallbackParseCapture(
      "Met Neha today from ABC Studio, interested in website redesign, budget 80k, send proposal Friday",
      new Date("2026-04-01T09:00:00.000Z")
    );

    const result = await applyCapturePreview(
      workspace.id,
      user.id,
      "Met Neha today from ABC Studio, interested in website redesign, budget 80k, send proposal Friday",
      preview
    );

    const [contacts, deals, tasks, notes, activities, captures] = await Promise.all([
      prisma.contact.findMany({ where: { workspaceId: workspace.id } }),
      prisma.deal.findMany({ where: { workspaceId: workspace.id } }),
      prisma.task.findMany({ where: { workspaceId: workspace.id } }),
      prisma.note.findMany({ where: { workspaceId: workspace.id } }),
      prisma.activity.findMany({ where: { workspaceId: workspace.id } }),
      prisma.parsedCapture.findMany({ where: { workspaceId: workspace.id } })
    ]);

    expect(result.contactId).toBeTruthy();
    expect(result.dealId).toBeTruthy();
    expect(result.taskId).toBeTruthy();
    expect(contacts).toHaveLength(1);
    expect(deals[0]?.amount).toBe(80000);
    expect(tasks[0]?.title).toContain("proposal");
    expect(notes[0]?.content).toContain("budget 80k");
    expect(captures).toHaveLength(1);
    expect(activities.length).toBeGreaterThanOrEqual(4);
  });
});
