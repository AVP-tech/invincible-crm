import { NextResponse } from "next/server";
import { getApiUser, createPasswordHash, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError, readJson } from "@/lib/http";
import { profileInputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const parsed = profileInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid profile update");
  }

  if (parsed.data.newPassword && !parsed.data.currentPassword) {
    return jsonError("Enter the current password to set a new one");
  }

  if (parsed.data.currentPassword) {
    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);

    if (!valid) {
      return jsonError("Current password is incorrect", 401);
    }
  }

  const updateData: {
    name: string;
    email: string;
    passwordHash?: string;
  } = {
    name: parsed.data.name,
    email: parsed.data.email
  };

  if (parsed.data.newPassword) {
    updateData.passwordHash = await createPasswordHash(parsed.data.newPassword);
  }

  await db.user.update({
    where: {
      id: user.accountUserId
    },
    data: updateData
  });

  return NextResponse.json({ ok: true });
}
