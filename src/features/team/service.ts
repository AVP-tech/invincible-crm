import { ActivityType, WorkspaceRole } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createPasswordHash } from "@/lib/auth";
import { type TeamMemberInput } from "@/lib/schemas";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { getTeamInviteEmailHtml } from "@/lib/email-templates";

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
  // For the invite flow, we generate a token instead of creating the user immediately
  const tokenPayload = {
    email: input.email,
    name: input.name,
    role: input.role,
    workspaceId,
    invitedByUserId
  };
  
  const token = jwt.sign(tokenPayload, env.sessionSecret, { expiresIn: "7d" });
  
  const [inviter, workspace] = await Promise.all([
    db.user.findUnique({ where: { id: invitedByUserId } }),
    db.workspace.findUnique({ where: { id: workspaceId } })
  ]);
  
  if (!inviter || !workspace) {
    throw new Error("Workspace or inviter not found");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteLink = `${appUrl}/invite?token=${token}`;
  
  const html = getTeamInviteEmailHtml({
    inviterName: inviter.name,
    workspaceName: workspace.name,
    inviteLink
  });
  
  await sendEmail({
    to: input.email,
    subject: `You're invited to join ${workspace.name}`,
    html
  });

  await logActivity({
    userId: workspaceOwnerId,
    type: ActivityType.TEAM_MEMBER_ADDED,
    title: `Sent invite to: ${input.name}`,
    description: `Role: ${input.role}`,
    entityType: "user",
    entityId: workspaceOwnerId
  });

  return { success: true };
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
