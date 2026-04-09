import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { applyCsvContactImport, previewCsvContactImport } from "@/features/imports/contacts";

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

describe("csv contact import", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("detects creates and updates, then applies them", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Import User",
        email: "import@example.com",
        passwordHash: "hashed"
      }
    });

    const company = await prisma.company.create({
      data: {
        userId: user.id,
        name: "Northline Fitness"
      }
    });

    await prisma.contact.create({
      data: {
        userId: user.id,
        companyId: company.id,
        name: "Rahul Verma",
        email: "rahul@northline.example.com",
        source: "Instagram",
        tags: ["Follow-up"]
      }
    });

    const csvText =
      'Name,Email,Phone,Company,Source,Tags\nRahul Verma,rahul@northline.example.com,+91 98765 44002,Northline Fitness,Instagram,"Follow-up;Operations"\nAisha Khan,aisha@newleaf.example.com,+91 98989 12345,Newleaf Studio,Referral,"Design;Warm"';

    const preview = await previewCsvContactImport(user.id, csvText);

    expect(preview.summary.createCount).toBe(1);
    expect(preview.summary.updateCount).toBe(1);

    const result = await applyCsvContactImport(user.id, preview);
    const contacts = await prisma.contact.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        name: "asc"
      }
    });

    expect(result.createdCount).toBe(1);
    expect(result.updatedCount).toBe(1);
    expect(contacts).toHaveLength(2);
    expect(contacts.find((contact) => contact.name === "Rahul Verma")?.phone).toBe("+91 98765 44002");
    expect(contacts.find((contact) => contact.name === "Aisha Khan")?.email).toBe("aisha@newleaf.example.com");
  });
});
