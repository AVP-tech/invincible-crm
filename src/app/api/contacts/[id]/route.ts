import { NextResponse } from "next/server";
import { canWriteWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { contactInputSchema } from "@/lib/schemas";
import { deleteContact, updateContact } from "@/features/contacts/service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const parsed = contactInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid contact payload");
  }

  const { id } = await params;
  const contact = await updateContact(user.id, id, parsed.data);

  return NextResponse.json({ ok: true, contact });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const { id } = await params;
  const deleted = await deleteContact(user.id, id);

  if (!deleted) {
    return jsonError("Contact not found", 404);
  }

  return NextResponse.json({ ok: true });
}
