import { DealStage } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canWriteWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { moveDealStage } from "@/features/deals/service";

const moveSchema = z.object({
  stage: z.nativeEnum(DealStage)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const parsed = moveSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError("Invalid deal stage");
  }

  const { id } = await params;
  const deal = await moveDealStage(user.workspaceId, user.id, id, parsed.data.stage);

  if (!deal) {
    return jsonError("Deal not found", 404);
  }

  return NextResponse.json({ ok: true, deal });
}
