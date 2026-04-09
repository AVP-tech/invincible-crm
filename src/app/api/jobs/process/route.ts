import { NextResponse } from "next/server";
import { canManageWorkspace, getApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { processDueJobs } from "@/features/jobs/service";

export async function POST() {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canManageWorkspace(user)) {
    return jsonError("You do not have permission to process jobs", 403);
  }

  const processed = await processDueJobs();

  return NextResponse.json({ ok: true, processed });
}
