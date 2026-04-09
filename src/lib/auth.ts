import { createHash } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { WorkspaceRole } from "@prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { ensureWorkspaceForUser, getPrimaryWorkspaceMembership } from "@/lib/workspace";

const SESSION_COOKIE = "invisible_crm_session";

function hashToken(token: string) {
  return createHash("sha256").update(`${token}:${env.sessionSecret}`).digest("hex");
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createPasswordHash(password: string) {
  return bcrypt.hash(password, 10);
}

export async function createSession(userId: string) {
  const token = nanoid(48);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await db.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt
    }
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.session.deleteMany({
      where: {
        tokenHash: hashToken(token)
      }
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export type CurrentWorkspaceUser = Awaited<ReturnType<typeof getCurrentUser>>;

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await db.session.findUnique({
    where: {
      tokenHash: hashToken(token)
    },
    include: {
      user: true
    }
  });

  if (!session || session.expiresAt < new Date()) {
    cookieStore.delete(SESSION_COOKIE);

    if (session) {
      await db.session.delete({
        where: {
          id: session.id
        }
      });
    }

    return null;
  }

  let membership = await getPrimaryWorkspaceMembership(session.user.id);

  if (!membership) {
    await ensureWorkspaceForUser(session.user.id, session.user.name);
    membership = await getPrimaryWorkspaceMembership(session.user.id);
  }

  if (!membership) {
    return null;
  }

  return {
    ...session.user,
    id: membership.workspace.ownerUserId,
    accountUserId: session.user.id,
    workspaceId: membership.workspaceId,
    workspaceOwnerId: membership.workspace.ownerUserId,
    workspaceRole: membership.role
  };
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getApiUser() {
  return getCurrentUser();
}

export function canWriteWorkspace(user: NonNullable<CurrentWorkspaceUser>) {
  return user.workspaceRole !== WorkspaceRole.VIEWER;
}

export function canManageWorkspace(user: NonNullable<CurrentWorkspaceUser>) {
  return user.workspaceRole === WorkspaceRole.OWNER || user.workspaceRole === WorkspaceRole.ADMIN;
}
