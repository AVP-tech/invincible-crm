import { NextResponse } from "next/server";
import { canWriteWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { dealInputSchema } from "@/lib/schemas";
import { deleteDeal, updateDeal } from "@/features/deals/service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const deal = await updateDeal(user.id, id, parsed.data);

  return NextResponse.json({ ok: true, deal });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const { id } = await params;
  const deal = await deleteDeal(user.id, id);

  if (!deal) {
    return jsonError("Deal not found", 404);
  }

  return NextResponse.json({ ok: true });
}
