import { NextResponse } from "next/server";
import { getApiUser, canManageWorkspace } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { teamMemberInputSchema } from "@/lib/schemas";
import { createWorkspaceMember } from "@/features/team/service";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canManageWorkspace(user)) {
    return jsonError("You do not have permission to manage the team", 403);
  }

  const parsed = teamMemberInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid teammate payload");
  }

  const membership = await createWorkspaceMember(user.workspaceId, user.workspaceOwnerId, user.accountUserId, parsed.data);

  return NextResponse.json({ ok: true, membership });
}
