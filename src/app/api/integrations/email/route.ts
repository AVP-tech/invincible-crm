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
    const parsed = emailIntegrationInputSchema.safeParse({ name: name || "Primary Inbox", ...json });

    if (!parsed.success) {
      return jsonError("Invalid email configuration parameters.", 400);
    }

    const connection = await upsertEmailIntegration(user.workspaceId, parsed.data);
    return NextResponse.json({ ok: true, connection });
  } catch (error) {
    return jsonError("Failed to save email integration settings", 500);
  }
}
