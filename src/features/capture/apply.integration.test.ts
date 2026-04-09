import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { applyCapturePreview } from "@/features/capture/service";
import { fallbackParseCapture } from "@/features/capture/parser";

const prisma = new PrismaClient();

async function resetDatabase() {
  await prisma.activity.deleteMany();
  await prisma.conversationLog.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.parsedCapture.deleteMany();
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

    const preview = fallbackParseCapture(
      "Met Neha today from ABC Studio, interested in website redesign, budget 80k, send proposal Friday",
      new Date("2026-04-01T09:00:00.000Z")
    );

    const result = await applyCapturePreview(user.id, "Met Neha today from ABC Studio, interested in website redesign, budget 80k, send proposal Friday", preview);

    const [contacts, deals, tasks, notes, activities, captures] = await Promise.all([
      prisma.contact.findMany(),
      prisma.deal.findMany(),
      prisma.task.findMany(),
      prisma.note.findMany(),
      prisma.activity.findMany(),
      prisma.parsedCapture.findMany()
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
