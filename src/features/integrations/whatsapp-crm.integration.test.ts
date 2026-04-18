import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient, IntegrationProvider, IntegrationStatus } from "@prisma/client";
import { saveWhatsappMessageToCrm } from "@/features/integrations/whatsapp-crm";

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

describe("saveWhatsappMessageToCrm", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("creates a new contact on the first message and appends notes on later messages", async () => {
    const user = await prisma.user.create({
      data: {
        name: "CRM Owner",
        email: "crm-owner@example.com",
        passwordHash: "hashed"
      }
    });

    const workspace = await prisma.workspace.create({
      data: {
        ownerUserId: user.id,
        name: "CRM Workspace"
      }
    });

    await prisma.workspaceMembership.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "OWNER"
      }
    });

    await prisma.integrationConnection.create({
      data: {
        workspaceId: workspace.id,
        provider: IntegrationProvider.WHATSAPP_META,
        name: "WhatsApp",
        status: IntegrationStatus.CONNECTED,
        config: {
          phoneNumberId: "phone-number-id",
          verifyToken: "verify-token"
        }
      }
    });

    const firstResult = await saveWhatsappMessageToCrm({
      phoneNumberId: "phone-number-id",
      senderPhone: "919999999999",
      messageText: "Hello from customer",
      contactName: "Aisha Khan",
      receivedAt: new Date("2026-04-18T10:00:00.000Z")
    });

    const secondResult = await saveWhatsappMessageToCrm({
      phoneNumberId: "phone-number-id",
      senderPhone: "+91 99999 99999",
      messageText: "Need pricing details",
      contactName: "Aisha Khan",
      receivedAt: new Date("2026-04-18T10:05:00.000Z")
    });

    const contacts = await prisma.contact.findMany({
      where: {
        workspaceId: workspace.id
      }
    });
    const notes = await prisma.note.findMany({
      where: {
        workspaceId: workspace.id
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    expect(firstResult?.createdContact).toBe(true);
    expect(secondResult?.createdContact).toBe(false);
    expect(contacts).toHaveLength(1);
    expect(contacts[0]?.name).toBe("Aisha Khan");
    expect(contacts[0]?.phone).toBe("919999999999");
    expect(notes).toHaveLength(2);
    expect(notes.map((note) => note.content)).toEqual(["Hello from customer", "Need pricing details"]);
    expect(notes[0]?.contactId).toBe(contacts[0]?.id);
    expect(notes[1]?.contactId).toBe(contacts[0]?.id);
  });
});
