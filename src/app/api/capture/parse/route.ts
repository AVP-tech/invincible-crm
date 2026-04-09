import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { captureParseRequestSchema } from "@/lib/schemas";
import { parseCapturePreview } from "@/features/capture/parser";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const parsed = captureParseRequestSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid quick capture input");
  }

  const preview = await parseCapturePreview(user.id, parsed.data.input);

  return NextResponse.json({ ok: true, preview });
}
