import { NextResponse } from "next/server";
import { canWriteWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { transcriptApplyRequestSchema } from "@/lib/schemas";
import { applyCapturePreview } from "@/features/capture/service";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const parsed = transcriptApplyRequestSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid transcript confirmation");
  }

  const result = await applyCapturePreview(user.workspaceId, user.id, parsed.data.transcript, parsed.data.preview, {
    noteSource: "transcript_import",
    captureTitle: "Transcript import applied",
    captureDescription: parsed.data.summary,
    contactActivityTitle: parsed.data.preview.existingContactId ? "Updated contact from transcript" : "Created contact from transcript",
    dealActivityTitle: parsed.data.preview.existingDealId ? "Updated deal from transcript" : "Created deal from transcript",
    taskActivityTitle: "Created task from transcript",
    noteActivityTitle: "Added meeting note from transcript"
  });

  return NextResponse.json({
    ok: true,
    result,
    redirectTo: result.contactId ? `/contacts/${result.contactId}` : result.dealId ? `/deals/${result.dealId}` : "/dashboard"
  });
}
