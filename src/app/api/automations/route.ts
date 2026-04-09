import { NextResponse } from "next/server";
import { getApiUser, canManageWorkspace } from "@/lib/auth";
import { readJson, jsonError } from "@/lib/http";
import { automationRuleInputSchema } from "@/lib/schemas";
import { createAutomationRule } from "@/features/automations/service";

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) {
      return jsonError("Unauthorized", 401);
    }
    
    if (!canManageWorkspace(user)) {
      return jsonError("Only workspace managers can configure automations.", 403);
    }

    const json = await readJson(request);
    const parsed = automationRuleInputSchema.safeParse(json);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid automation parameters.", 400);
    }

    const rule = await createAutomationRule(user.workspaceId, user.id, parsed.data);
    return NextResponse.json({ ok: true, rule });
  } catch (error) {
    return jsonError("Failed to create automation rule", 500);
  }
}
