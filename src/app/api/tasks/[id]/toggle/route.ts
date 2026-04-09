import { NextResponse } from "next/server";
import { canWriteWorkspace, getApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { quickToggleTask } from "@/features/tasks/service";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const { id } = await params;
  const task = await quickToggleTask(user.id, id);

  if (!task) {
    return jsonError("Task not found", 404);
  }

  return NextResponse.json({ ok: true, task: task.task, spawnedTask: task.spawnedTask });
}
