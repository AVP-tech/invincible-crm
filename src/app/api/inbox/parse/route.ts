import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { inboxParseRequestSchema } from "@/lib/schemas";
import { parseInboxPreview } from "@/features/inbox/service";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const parsed = inboxParseRequestSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid inbox capture input");
  }

  const preview = await parseInboxPreview(user.id, parsed.data);

  return NextResponse.json({ ok: true, preview });
}
