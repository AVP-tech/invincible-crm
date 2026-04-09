import { NextResponse } from "next/server";
import { canManageWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { invoiceInputSchema } from "@/lib/schemas";
import { createInvoice } from "@/features/finance/service";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canManageWorkspace(user)) {
    return jsonError("You do not have permission to manage finance data", 403);
  }

  const parsed = invoiceInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid invoice payload");
  }

  const invoice = await createInvoice(user.workspaceId, user.workspaceOwnerId, parsed.data);

  return NextResponse.json({ ok: true, invoice });
}
