import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { jsonError, readJson } from "@/lib/http";
import { acceptInviteSchema } from "@/lib/schemas";
import { createPasswordHash, createSession } from "@/lib/auth";
import { WorkspaceRole } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const parsed = acceptInviteSchema.safeParse(await readJson(request));

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload");
    }

    const { token, password } = parsed.data;

    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, env.sessionSecret) as {
        email: string;
        name: string;
        role: WorkspaceRole;
        workspaceId: string;
        invitedByUserId: string;
      };
    } catch (err) {
      return jsonError("Invite link has expired or is invalid", 400);
    }

    // Check if user already exists
    let user = await db.user.findUnique({
      where: { email: payload.email }
    });

    if (!user) {
      // Create user
      user = await db.user.create({
        data: {
          name: payload.name,
          email: payload.email,
          passwordHash: await createPasswordHash(password),
          onboardingCompleted: true
        }
      });
    }

    // Upsert membership
    await db.workspaceMembership.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: payload.workspaceId,
          userId: user.id
        }
      },
      update: {
        role: payload.role,
        invitedByUserId: payload.invitedByUserId
      },
      create: {
        workspaceId: payload.workspaceId,
        userId: user.id,
        invitedByUserId: payload.invitedByUserId,
        role: payload.role
      }
    });

    // Automatically log them in
    await createSession(user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError("Something went wrong processing the invitation", 500);
  }
}
