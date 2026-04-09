import { NextResponse } from "next/server";
import { canWriteWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { captureApplyRequestSchema } from "@/lib/schemas";
import { applyCapturePreview } from "@/features/capture/service";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const parsed = captureApplyRequestSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid capture confirmation");
  }

  const result = await applyCapturePreview(user.id, parsed.data.input, parsed.data.preview);

  return NextResponse.json({
    ok: true,
    result,
    redirectTo: result.contactId ? `/contacts/${result.contactId}` : result.dealId ? `/deals/${result.dealId}` : "/dashboard"
  });
}
