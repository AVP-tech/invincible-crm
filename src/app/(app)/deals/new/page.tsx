import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DealForm } from "@/components/forms/deal-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewDealPage() {
  const user = await requireUser();
  const [contacts, members] = await Promise.all([
    db.contact.findMany({
      where: { workspaceId: user.workspaceId },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
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
        eyebrow="Deals"
        title="Create a deal"
        description="Keep the opportunity shape simple: who it is for, what it is worth, and what should happen next."
      />

      <Card>
        <CardHeader />
        <CardContent className="pt-0">
          <DealForm mode="create" contacts={contacts} members={members.map((member) => member.user)} />
        </CardContent>
      </Card>
    </div>
  );
}
