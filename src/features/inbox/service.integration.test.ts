import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ConversationSource, PrismaClient } from "@prisma/client";

vi.mock("@/lib/env", () => ({
  env: {
    openAiApiKey: "",
    openAiModel: "gpt-4o-mini"
  }
}));

import { applyInboxPreview, parseInboxPreview } from "@/features/inbox/service";

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

describe("inbox capture", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("turns a pasted conversation into a stored conversation log and CRM updates", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Inbox User",
        email: "inbox@example.com",
        passwordHash: "hashed"
      }
    });
    const workspace = await prisma.workspace.create({
      data: {
        ownerUserId: user.id,
        name: "Inbox Workspace"
      }
    });

    await prisma.workspaceMembership.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "OWNER"
      }
    });

    const input = {
      source: ConversationSource.WHATSAPP,
      subject: "Proposal follow-up",
      participantLabel: "Neha Sharma • ABC Studio",
      content:
        "Neha: The proposal looks good so far.\nNeha: Can you send the updated version by Friday and include the landing page rewrite?\nYou: Yes, I will send it tomorrow.\nNeha: Budget is still around 80k."
    };

    const preview = await parseInboxPreview(workspace.id, input, new Date("2026-04-01T09:00:00.000Z"));
    const result = await applyInboxPreview(workspace.id, user.id, {
      ...input,
      summary: preview.summary,
      actionItems: preview.actionItems,
      preview: preview.preview
    });

    const [conversations, contacts, deals, tasks, notes] = await Promise.all([
      prisma.conversationLog.findMany({ where: { workspaceId: workspace.id } }),
      prisma.contact.findMany({ where: { workspaceId: workspace.id } }),
      prisma.deal.findMany({ where: { workspaceId: workspace.id } }),
      prisma.task.findMany({ where: { workspaceId: workspace.id } }),
      prisma.note.findMany({ where: { workspaceId: workspace.id } })
    ]);

    expect(preview.summary.length).toBeGreaterThan(10);
    expect(result.conversation.source).toBe(ConversationSource.WHATSAPP);
    expect(conversations).toHaveLength(1);
    expect(contacts).toHaveLength(1);
    expect(deals[0]?.amount).toBe(80000);
    expect(tasks[0]?.title).toContain("proposal");
    expect(notes[0]?.content).toContain("WhatsApp capture");
  });
});
