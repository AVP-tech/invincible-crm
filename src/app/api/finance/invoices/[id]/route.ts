import { NextResponse } from "next/server";
import { canManageWorkspace, getApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { deleteInvoice } from "@/features/finance/service";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canManageWorkspace(user)) {
    return jsonError("You do not have permission to manage finance data", 403);
  }

  const { id } = await params;
  const invoice = await deleteInvoice(user.workspaceId, id);

  if (!invoice) {
    return jsonError("Invoice not found", 404);
  }

  return NextResponse.json({ ok: true });
}
