import { NextResponse } from "next/server";
import { getApiUser, canManageWorkspace } from "@/lib/auth";
import { readJson, jsonError } from "@/lib/http";
import { upsertWhatsappIntegration } from "@/features/integrations/service";
import { whatsappIntegrationInputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    if (!canManageWorkspace(user)) {
      return jsonError("Only workspace managers can configure WhatsApp settings.", 403);
    }

    const { name, ...json } = (await readJson(request)) as Record<string, any>;
    const parsed = whatsappIntegrationInputSchema.safeParse({ name: name || "Primary WhatsApp", ...json });

    if (!parsed.success) {
      return jsonError("Invalid WhatsApp configuration parameters.", 400);
    }

    const connection = await upsertWhatsappIntegration(user.workspaceId, parsed.data);
    return NextResponse.json({ ok: true, connection });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to save WhatsApp integration settings", 500);
  }
}
