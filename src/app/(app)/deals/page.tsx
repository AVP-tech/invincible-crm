import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listDeals } from "@/features/deals/service";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DealsBoard } from "@/components/deals-board";

export default async function DealsPage() {
  const user = await requireUser();
  const deals = await listDeals(user.workspaceId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deals"
        title="Simple pipeline, visible momentum"
        description="Move deals across stages quickly and keep enough context to know what should happen next."
        actions={
          <Link href="/deals/new">
            <Button>New deal</Button>
          </Link>
        }
      />

      {deals.length ? (
        <DealsBoard deals={deals} />
      ) : (
        <EmptyState
          title="No deals yet"
          description="Create a deal manually or let quick capture turn a sales update into a structured opportunity."
          actionHref="/deals/new"
          actionLabel="Create first deal"
        />
      )}
    </div>
  );
}
