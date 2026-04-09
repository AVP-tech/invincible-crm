import { NextResponse } from "next/server";
import { canWriteWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { noteInputSchema } from "@/lib/schemas";
import { addContactNote } from "@/features/contacts/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const parsed = noteInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Note content is required");
  }

  const { id } = await params;
  const note = await addContactNote(user.id, id, parsed.data.content);

  return NextResponse.json({ ok: true, note });
}
