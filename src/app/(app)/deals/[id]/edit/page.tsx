import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDeal } from "@/features/deals/service";
import { DealForm } from "@/components/forms/deal-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const deal = await getDeal(user.id, id);

  if (!deal) {
    notFound();
  }

  const [contacts, members] = await Promise.all([
    db.contact.findMany({
      where: { userId: user.id },
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
        title={`Edit ${deal.title}`}
        description="Update the essentials only: stage, value, next step, and relationship context."
      />

      <Card>
        <CardHeader />
        <CardContent className="pt-0">
          <DealForm
            mode="edit"
            dealId={deal.id}
            contacts={contacts}
            members={members.map((member) => member.user)}
            defaultValues={{
              title: deal.title,
              description: deal.description,
              contactId: deal.contactId,
              assignedToUserId: deal.assignedToUserId,
              companyName: deal.company?.name,
              stage: deal.stage,
              amount: deal.amount,
              currency: deal.currency,
              expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.toISOString().slice(0, 10) : "",
              nextStep: deal.nextStep
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
