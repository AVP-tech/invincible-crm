import { NextResponse } from "next/server";
import { authRegisterSchema } from "@/lib/schemas";
import { db } from "@/lib/db";
import { createPasswordHash, createSession } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { ensureWorkspaceForUser } from "@/lib/workspace";

export async function POST(request: Request) {
  const parsed = authRegisterSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid sign up request");
  }

  const existing = await db.user.findUnique({
    where: {
      email: parsed.data.email
    }
  });

  if (existing) {
    return jsonError("An account with that email already exists");
  }

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await createPasswordHash(parsed.data.password)
    }
  });

  await ensureWorkspaceForUser(user.id, user.name);
  await createSession(user.id);

  return NextResponse.json({
    ok: true,
    redirectTo: "/welcome"
  });
}
