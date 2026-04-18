import { NextResponse } from "next/server";
import { canWriteWorkspace, getApiUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { taskInputSchema } from "@/lib/schemas";
import { deleteTask, updateTask } from "@/features/tasks/service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const parsed = taskInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid task payload");
  }

  const { id } = await params;
  const result = await updateTask(user.workspaceId, user.id, id, parsed.data);

  if (!result) {
    return jsonError("Task not found", 404);
  }

  return NextResponse.json({ ok: true, task: result.task, spawnedTask: result.spawnedTask });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!canWriteWorkspace(user)) {
    return jsonError("You have read-only access in this workspace", 403);
  }

  const { id } = await params;
  const task = await deleteTask(user.workspaceId, user.id, id);

  if (!task) {
    return jsonError("Task not found", 404);
  }

  return NextResponse.json({ ok: true });
}
