import { NextResponse } from "next/server";
import { canWriteWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { dealInputSchema } from "@/lib/schemas";
import { createDeal } from "@/features/deals/service";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const parsed = dealInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid deal payload");
  }

  const deal = await createDeal(user.id, parsed.data);

  return NextResponse.json({ ok: true, deal });
}
