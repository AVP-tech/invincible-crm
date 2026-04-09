import { ActivityType } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { type ContactInput } from "@/lib/schemas";

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

function parseTags(tagsText: string) {
  return tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function listContacts(userId: string) {
  return db.contact.findMany({
    where: { userId },
    include: {
      company: true,
      deals: {
        orderBy: {
          updatedAt: "desc"
        }
      },
      tasks: {
        orderBy: {
          dueDate: "asc"
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}

export async function getContact(userId: string, contactId: string) {
  return db.contact.findFirst({
    where: {
      id: contactId,
      userId
    },
    include: {
      company: true,
      deals: {
        orderBy: {
          updatedAt: "desc"
        }
      },
      tasks: {
        orderBy: {
          dueDate: "asc"
        }
      },
      notes: {
        orderBy: {
          createdAt: "desc"
        }
      },
      conversationLogs: {
        orderBy: {
          createdAt: "desc"
        },
        take: 6
      },
      activities: {
        orderBy: {
          createdAt: "desc"
        },
        take: 20
      }
    }
  });
}

export async function createContact(userId: string, input: ContactInput) {
  const company = await upsertCompany(userId, input.companyName);

  const contact = await db.contact.create({
    data: {
      userId,
      companyId: company?.id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      source: input.source,
      tags: parseTags(input.tagsText)
    },
    include: {
      company: true
    }
  });

  await logActivity({
    userId,
    type: ActivityType.CONTACT_CREATED,
    title: `${contact.name} was added to contacts`,
    description: contact.source ? `Source: ${contact.source}` : undefined,
    entityType: "contact",
    entityId: contact.id,
    contactId: contact.id
  });

  return contact;
}

export async function updateContact(userId: string, contactId: string, input: ContactInput) {
  const company = await upsertCompany(userId, input.companyName);

  const contact = await db.contact.update({
    where: {
      id: contactId
    },
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      source: input.source,
      companyId: company?.id,
      tags: parseTags(input.tagsText)
    },
    include: {
      company: true
    }
  });

  await logActivity({
    userId,
    type: ActivityType.CONTACT_UPDATED,
    title: `${contact.name} was updated`,
    entityType: "contact",
    entityId: contact.id,
    contactId: contact.id
  });

  return contact;
}

export async function deleteContact(userId: string, contactId: string) {
  const existing = await db.contact.findFirst({
    where: {
      id: contactId,
      userId
    }
  });

  if (!existing) return null;

  await db.contact.delete({
    where: {
      id: contactId
    }
  });

  await logActivity({
    userId,
    type: ActivityType.CONTACT_DELETED,
    title: `${existing.name} was removed`,
    entityType: "contact",
    entityId: contactId
  });

  return existing;
}

export async function addContactNote(userId: string, contactId: string, content: string) {
  const note = await db.note.create({
    data: {
      userId,
      contactId,
      content,
      source: "manual"
    }
  });

  await logActivity({
    userId,
    type: ActivityType.NOTE_ADDED,
    title: "Note added",
    description: content,
    entityType: "note",
    entityId: note.id,
    contactId,
    noteId: note.id
  });

  return note;
}
