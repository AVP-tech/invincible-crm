import { NextResponse } from "next/server";
import { getApiUser, canManageWorkspace } from "@/lib/auth";
import { readJson, jsonError } from "@/lib/http";
import { upsertEmailIntegration } from "@/features/integrations/service";
import { emailIntegrationInputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) {
      return jsonError("Unauthorized", 401);
    }
    
    if (!canManageWorkspace(user)) {
      return jsonError("Only workspace managers can configure IMAP settings.", 403);
    }

    const { name, ...json } = (await readJson(request)) as Record<string, any>;
    if (typeof json.secure === "string") {
      json.secure = json.secure === "true";
    }
    const parsed = emailIntegrationInputSchema
      .partial({ password: true })
      .safeParse({
        name: name || "Primary Inbox",
        ...json,
        password: typeof json.password === "string" && json.password.trim() ? json.password : undefined,
      });

    if (!parsed.success) {
      return jsonError("Invalid email configuration parameters.", 400);
    }

    const connection = await upsertEmailIntegration(user.workspaceId, parsed.data);
    return NextResponse.json({ ok: true, connection });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to save email integration settings", 500);
  }
}
