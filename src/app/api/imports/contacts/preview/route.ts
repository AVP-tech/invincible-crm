import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { csvContactPreviewRequestSchema } from "@/lib/schemas";
import { previewCsvContactImport } from "@/features/imports/contacts";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const parsed = csvContactPreviewRequestSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid CSV preview request");
  }

  const preview = await previewCsvContactImport(user.workspaceId, parsed.data.csvText);

  return NextResponse.json({
    ok: true,
    preview
  });
}
