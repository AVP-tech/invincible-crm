import { ActivityType, WorkspaceRole } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createPasswordHash } from "@/lib/auth";
import { type TeamMemberInput } from "@/lib/schemas";

export async function listWorkspaceMembers(workspaceId: string) {
  return db.workspaceMembership.findMany({
    where: {
      workspaceId
    },
    include: {
      user: true
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }]
  });
}

export async function createWorkspaceMember(
  workspaceId: string,
  workspaceOwnerId: string,
  invitedByUserId: string,
  input: TeamMemberInput
) {
  const existingUser = await db.user.findUnique({
    where: {
      email: input.email
    }
  });

  const user =
    existingUser ??
    (await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await createPasswordHash(input.password),
        onboardingCompleted: true
      }
    }));

  const membership = await db.workspaceMembership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id
      }
    },
    update: {
      role: input.role,
      invitedByUserId
    },
    create: {
      workspaceId,
      userId: user.id,
      invitedByUserId,
      role: input.role
    },
    include: {
      user: true
    }
  });

  await logActivity({
    userId: workspaceOwnerId,
    type: ActivityType.TEAM_MEMBER_ADDED,
    title: `Added teammate: ${membership.user.name}`,
    description: `Role: ${membership.role}`,
    entityType: "user",
    entityId: membership.user.id
  });

  return membership;
}

export async function updateWorkspaceMemberRole(workspaceId: string, membershipId: string, role: WorkspaceRole) {
  return db.workspaceMembership.update({
    where: {
      id: membershipId
    },
    data: {
      role
    },
    include: {
      user: true
    }
  });
}

export async function removeWorkspaceMember(workspaceId: string, membershipId: string) {
  const membership = await db.workspaceMembership.findFirst({
    where: {
      id: membershipId,
      workspaceId
    },
    include: {
      user: true
    }
  });

  if (!membership || membership.role === WorkspaceRole.OWNER) {
    return null;
  }

  await db.workspaceMembership.delete({
    where: {
      id: membershipId
    }
  });

  return membership;
}
