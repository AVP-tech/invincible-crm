import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { captureParseRequestSchema } from "@/lib/schemas";
import { parseCaptureResult } from "@/features/capture/parser";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const parsed = captureParseRequestSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid quick capture input");
  }

  try {
    const result = await parseCaptureResult(user.workspaceId, parsed.data.input);

    return NextResponse.json({
      ok: true,
      preview: result.preview,
      status: result.status,
      fallbackReason: result.fallbackReason,
      provider: result.provider
    });
  } catch (error) {
    logger.error("Quick capture parse route failed.", error, {
      route: "/api/capture/parse"
    });
    return jsonError("Could not parse this capture", 500);
  }
}
