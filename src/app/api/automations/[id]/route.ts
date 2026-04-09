import { NextResponse } from "next/server";
import { getApiUser, canManageWorkspace } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { deleteAutomationRule } from "@/features/automations/service";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getApiUser();
    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    if (!canManageWorkspace(user)) {
      return jsonError("Only workspace managers can configure automations", 403);
    }

    const { id } = await params;
    const deleted = await deleteAutomationRule(user.workspaceId, id);

    if (!deleted) {
      return jsonError("Automation not found", 404);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError("Failed to delete automation", 500);
  }
}
