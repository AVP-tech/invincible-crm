import { ActivityType } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { coerceCsvContactRow, parseCsvText } from "@/features/imports/csv";
import { csvContactImportPreviewSchema, type CsvContactImportPreview } from "@/lib/schemas";

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function parseTags(tagsText: string) {
  return tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function upsertCompany(userId: string, companyName?: string) {
  if (!companyName) return null;

  return db.company.upsert({
    where: {
      userId_name: {
        userId,
        name: companyName
      }
    },
    update: {},
    create: {
      userId,
      name: companyName
    }
  });
}

export async function previewCsvContactImport(userId: string, csvText: string): Promise<CsvContactImportPreview> {
  const parsedCsv = parseCsvText(csvText);
  const existingContacts = await db.contact.findMany({
    where: { userId },
    include: {
      company: true
    }
  });

  const rows = parsedCsv.rows.map((row, index) => {
    const contact = coerceCsvContactRow(parsedCsv.headers, row);

    if (!contact.name && !contact.email) {
      return {
        rowNumber: index + 2,
        action: "skip" as const,
        reason: "Missing both name and email",
        existingContactId: undefined,
        contact
      };
    }

    const existingByEmail = contact.email
      ? existingContacts.find((item) => normalize(item.email) === normalize(contact.email))
      : null;
    const existingByName = !existingByEmail
      ? existingContacts.find(
          (item) =>
            normalize(item.name) === normalize(contact.name) &&
            (!contact.companyName || normalize(item.company?.name) === normalize(contact.companyName))
        )
      : null;

    const existing = existingByEmail ?? existingByName;

    if (!existing) {
      return {
        rowNumber: index + 2,
        action: "create" as const,
        reason: "New contact",
        existingContactId: undefined,
        contact
      };
    }

    const incomingTags = parseTags(contact.tagsText);
    const existingTags = Array.isArray(existing.tags) ? (existing.tags as string[]) : [];
    const mergedTags = new Set([...existingTags.map((tag) => normalize(tag)), ...incomingTags.map((tag) => normalize(tag))]);
    const wouldChange =
      (contact.email && normalize(contact.email) !== normalize(existing.email)) ||
      (contact.phone && normalize(contact.phone) !== normalize(existing.phone)) ||
      (contact.source && normalize(contact.source) !== normalize(existing.source)) ||
      (contact.companyName && normalize(contact.companyName) !== normalize(existing.company?.name)) ||
      (incomingTags.length > 0 && mergedTags.size > existingTags.length);

    return {
      rowNumber: index + 2,
      action: wouldChange ? ("update" as const) : ("skip" as const),
      reason: wouldChange ? "Matches an existing contact and adds new information" : "Looks like an existing contact with no new details",
      existingContactId: existing.id,
      contact
    };
  });

  const summary = {
    totalRows: rows.length,
    createCount: rows.filter((row) => row.action === "create").length,
    updateCount: rows.filter((row) => row.action === "update").length,
    skipCount: rows.filter((row) => row.action === "skip").length
  };

  return csvContactImportPreviewSchema.parse({
    headers: parsedCsv.headers,
    rows,
    summary
  });
}

export async function applyCsvContactImport(userId: string, preview: CsvContactImportPreview) {
  let createdCount = 0;
  let updatedCount = 0;

  for (const row of preview.rows) {
    if (row.action === "skip") {
      continue;
    }

    const company = await upsertCompany(userId, row.contact.companyName ?? undefined);
    const tags = parseTags(row.contact.tagsText);

    if (row.action === "create") {
      const contact = await db.contact.create({
        data: {
          userId,
          name: row.contact.name ?? row.contact.email ?? `Imported contact ${row.rowNumber}`,
          email: row.contact.email ?? undefined,
          phone: row.contact.phone ?? undefined,
          companyId: company?.id,
          source: row.contact.source ?? "CSV import",
          tags
        }
      });

      createdCount += 1;

      await logActivity({
        userId,
        type: ActivityType.CONTACT_CREATED,
        title: `Created contact from CSV import: ${contact.name}`,
        description: row.reason,
        entityType: "contact",
        entityId: contact.id,
        contactId: contact.id
      });

      continue;
    }

    if (row.action === "update" && row.existingContactId) {
      const existing = await db.contact.findFirst({
        where: {
          id: row.existingContactId,
          userId
        }
      });

      if (!existing) {
        continue;
      }

      const existingTags = Array.isArray(existing.tags) ? (existing.tags as string[]) : [];
      const mergedTags = Array.from(new Set([...existingTags, ...tags]));

      const contact = await db.contact.update({
        where: { id: existing.id },
        data: {
          name: row.contact.name ?? existing.name,
          email: row.contact.email ?? existing.email ?? undefined,
          phone: row.contact.phone ?? existing.phone ?? undefined,
          source: row.contact.source ?? existing.source ?? undefined,
          companyId: company?.id ?? existing.companyId ?? undefined,
          tags: mergedTags
        }
      });

      updatedCount += 1;

      await logActivity({
        userId,
        type: ActivityType.CONTACT_UPDATED,
        title: `Updated contact from CSV import: ${contact.name}`,
        description: row.reason,
        entityType: "contact",
        entityId: contact.id,
        contactId: contact.id
      });
    }
  }

  return {
    createdCount,
    updatedCount,
    skippedCount: preview.summary.skipCount
  };
}
