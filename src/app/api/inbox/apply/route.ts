import { NextResponse } from "next/server";
import { canWriteWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { inboxApplyRequestSchema } from "@/lib/schemas";
import { applyInboxPreview } from "@/features/inbox/service";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const parsed = inboxApplyRequestSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid inbox capture payload");
  }

  const result = await applyInboxPreview(user.id, parsed.data);

  return NextResponse.json({
    ok: true,
    conversation: result.conversation,
    redirectTo: result.captureResult.contactId ? `/contacts/${result.captureResult.contactId}` : "/inbox"
  });
}
