import { ActivityType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type ActivityInput = {
  userId: string;
  workspaceId?: string;
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
  const workspaceId =
    input.workspaceId ??
    (await db.workspace
      .findUnique({
        where: {
          ownerUserId: input.userId
        },
        select: {
          id: true
        }
      })
      .then((workspace) => workspace?.id)) ??
    (await db.workspaceMembership
      .findFirst({
        where: {
          userId: input.userId
        },
        orderBy: {
          createdAt: "asc"
        },
        select: {
          workspaceId: true
        }
      })
      .then((membership) => membership?.workspaceId));

  if (!workspaceId) {
    throw new Error(`Could not resolve workspace for activity user ${input.userId}`);
  }

  return db.activity.create({
    data: {
      ...input,
      workspaceId
    }
  });
}
