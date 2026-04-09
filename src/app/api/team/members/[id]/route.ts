import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canManageWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { removeWorkspaceMember, updateWorkspaceMemberRole } from "@/features/team/service";

const roleUpdateSchema = z.object({
  role: z.nativeEnum(WorkspaceRole)
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canManageWorkspace(user)) {
    return jsonError("You do not have permission to manage the team", 403);
  }

  const parsed = roleUpdateSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid role update");
  }

  const { id } = await params;
  const membership = await updateWorkspaceMemberRole(user.workspaceId, id, parsed.data.role);

  return NextResponse.json({ ok: true, membership });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canManageWorkspace(user)) {
    return jsonError("You do not have permission to manage the team", 403);
  }

  const { id } = await params;
  const membership = await removeWorkspaceMember(user.workspaceId, id);

  if (!membership) {
    return jsonError("Team member not found or cannot be removed", 404);
  }

  return NextResponse.json({ ok: true });
}
