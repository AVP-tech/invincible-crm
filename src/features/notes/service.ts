import { ActivityType } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function addDealNote(userId: string, dealId: string, content: string) {
  const deal = await db.deal.findFirst({
    where: {
      id: dealId,
      userId
    }
  });

  if (!deal) return null;

  const note = await db.note.create({
    data: {
      userId,
      dealId,
      contactId: deal.contactId ?? undefined,
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
    contactId: deal.contactId,
    dealId,
    noteId: note.id
  });

  return note;
}
