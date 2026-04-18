import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDueLabel } from "@/lib/utils";
import { listTasks, type TaskFilter } from "@/features/tasks/service";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TaskPriorityBadge, TaskRecurrenceBadge, TaskStatusBadge } from "@/components/status-badges";
import { TaskToggleButton } from "@/components/task-toggle-button";

const filterOptions: TaskFilter[] = ["all", "today", "overdue", "recurring", "completed"];

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const filter = filterOptions.includes(params.filter as TaskFilter) ? (params.filter as TaskFilter) : "all";
  const tasks = await listTasks(user.workspaceId, filter);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tasks"
        title="Follow-ups without leakage"
        description="Keep the next action visible, and make it easy to close the loop when conversations move."
        actions={
          <Link href="/tasks/new">
            <Button>New task</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Link key={option} href={`/tasks?filter=${option}`}>
            <Button variant={option === filter ? "primary" : "secondary"}>{option}</Button>
          </Link>
        ))}
      </div>

      {tasks.length ? (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-ink">{task.title}</h2>
                    <TaskPriorityBadge priority={task.priority} />
                    <TaskStatusBadge status={task.status} />
                    <TaskRecurrenceBadge pattern={task.recurrencePattern} intervalDays={task.recurrenceIntervalDays} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {task.contact?.name ?? "No contact linked"} {task.deal ? `• ${task.deal.title}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{task.description ?? "No additional instructions"}</p>
                </div>
                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <p className="text-sm text-slate-500">{formatDueLabel(task.dueDate)}</p>
                  <div className="flex flex-wrap gap-2">
                    <TaskToggleButton taskId={task.id} isCompleted={task.status === "COMPLETED"} />
                    <Link href={`/tasks/${task.id}/edit`}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tasks in this view yet"
          description="Create one manually or let AI quick capture turn a message like “Call Rahul tomorrow” into a follow-up."
          actionHref="/tasks/new"
          actionLabel="Create task"
        />
      )}
    </div>
  );
}
