import { NextResponse } from "next/server";
import { canWriteWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { csvContactApplyRequestSchema } from "@/lib/schemas";
import { applyCsvContactImport } from "@/features/imports/contacts";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const parsed = csvContactApplyRequestSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid CSV import confirmation");
  }

  const result = await applyCsvContactImport(user.workspaceId, user.id, parsed.data.preview);

  return NextResponse.json({
    ok: true,
    result,
    redirectTo: "/contacts"
  });
}
