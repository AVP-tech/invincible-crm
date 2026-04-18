import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TaskForm } from "@/components/forms/task-form";
import { DeleteButton } from "@/components/delete-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [task, contacts, deals, members] = await Promise.all([
    db.task.findFirst({
      where: {
        id,
        workspaceId: user.workspaceId
      }
    }),
    db.contact.findMany({
      where: { workspaceId: user.workspaceId },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    db.deal.findMany({
      where: { workspaceId: user.workspaceId },
      select: { id: true, title: true },
      orderBy: { updatedAt: "desc" }
    }),
    db.workspaceMembership.findMany({
      where: { workspaceId: user.workspaceId },
      select: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    })
  ]);

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tasks"
        title={`Edit ${task.title}`}
        description="Update timing, priority, and connection to the right contact or deal."
        actions={<DeleteButton endpoint={`/api/tasks/${task.id}`} redirectTo="/tasks" label="task" />}
      />

      <Card>
        <CardHeader />
        <CardContent className="pt-0">
          <TaskForm
            mode="edit"
            taskId={task.id}
            contacts={contacts}
            deals={deals}
            members={members.map((member) => member.user)}
            defaultValues={{
              title: task.title,
              description: task.description,
              contactId: task.contactId,
              dealId: task.dealId,
              assignedToUserId: task.assignedToUserId,
              dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : "",
              priority: task.priority,
              status: task.status,
              recurrencePattern: task.recurrencePattern,
              recurrenceIntervalDays: task.recurrenceIntervalDays
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
