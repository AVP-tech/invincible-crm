import { NextResponse } from "next/server";
import { authLoginSchema } from "@/lib/schemas";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";

export async function POST(request: Request) {
  const parsed = authLoginSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid login request");
  }

  const user = await db.user.findUnique({
    where: {
      email: parsed.data.email
    }
  });

  if (!user) {
    return jsonError("No account found for that email", 404);
  }

  const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!passwordMatches) {
    return jsonError("Incorrect password", 401);
  }

  await createSession(user.id);

  return NextResponse.json({
    ok: true,
    redirectTo: user.onboardingCompleted ? "/dashboard" : "/welcome"
  });
}
