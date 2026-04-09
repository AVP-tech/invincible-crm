import { WorkspaceRole } from "@prisma/client";
import { db } from "@/lib/db";

export async function ensureWorkspaceForUser(userId: string, name: string) {
  const workspace = await db.workspace.upsert({
    where: {
      ownerUserId: userId
    },
    update: {
      name: name.endsWith(" Workspace") ? name : `${name} Workspace`
    },
    create: {
      ownerUserId: userId,
      name: name.endsWith(" Workspace") ? name : `${name} Workspace`,
      memberships: {
        create: {
          userId,
          role: WorkspaceRole.OWNER
        }
      }
    },
    include: {
      memberships: true
    }
  });

  const ownerMembership = workspace.memberships.find((membership) => membership.userId === userId);

  if (!ownerMembership) {
    await db.workspaceMembership.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: WorkspaceRole.OWNER
      }
    });
  }

  return workspace;
}

export async function getPrimaryWorkspaceMembership(userId: string) {
  return db.workspaceMembership.findFirst({
    where: {
      userId
    },
    include: {
      workspace: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function getWorkspaceByOwnerUserId(ownerUserId: string) {
  return db.workspace.findUnique({
    where: {
      ownerUserId
    }
  });
}
