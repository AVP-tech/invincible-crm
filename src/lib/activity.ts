import { ActivityType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type ActivityInput = {
  userId: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  entityType: "contact" | "deal" | "task" | "note" | "capture" | "user" | "conversation";
  entityId: string;
  metadata?: Prisma.InputJsonValue;
  contactId?: string | null;
  dealId?: string | null;
  taskId?: string | null;
  noteId?: string | null;
};

export async function logActivity(input: ActivityInput) {
  return db.activity.create({
    data: input
  });
}
