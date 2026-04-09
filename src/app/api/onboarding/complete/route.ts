import { NextResponse } from "next/server";
import { ActivityType } from "@prisma/client";
import { getApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { logActivity } from "@/lib/activity";

export async function POST() {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  await db.user.update({
    where: {
      id: user.id
    },
    data: {
      onboardingCompleted: true
    }
  });

  await logActivity({
    userId: user.id,
    type: ActivityType.USER_ONBOARDED,
    title: "Workspace onboarding completed",
    entityType: "user",
    entityId: user.id
  });

  return NextResponse.json({ ok: true });
}
