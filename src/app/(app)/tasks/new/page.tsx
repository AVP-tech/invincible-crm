import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TaskForm } from "@/components/forms/task-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewTaskPage() {
  const user = await requireUser();
  const [contacts, deals, members] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tasks"
        title="Create a follow-up"
        description="Keep tasks short and actionable. The goal is motion, not paperwork."
      />

      <Card>
        <CardHeader />
        <CardContent className="pt-0">
          <TaskForm mode="create" contacts={contacts} deals={deals} members={members.map((member) => member.user)} />
        </CardContent>
      </Card>
    </div>
  );
}
