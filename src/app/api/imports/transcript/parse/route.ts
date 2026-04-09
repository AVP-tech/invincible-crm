import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { transcriptParseRequestSchema } from "@/lib/schemas";
import { parseTranscriptPreview } from "@/features/imports/transcript";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const parsed = transcriptParseRequestSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid transcript import request");
  }

  const preview = await parseTranscriptPreview(user.id, parsed.data.transcript);

  return NextResponse.json({
    ok: true,
    preview
  });
}
