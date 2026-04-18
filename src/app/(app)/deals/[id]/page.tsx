import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getDeal } from "@/features/deals/service";
import { ActivityList } from "@/components/activity-list";
import { DeleteButton } from "@/components/delete-button";
import { NoteForm } from "@/components/forms/note-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { DealStageBadge, TaskPriorityBadge, TaskStatusBadge } from "@/components/status-badges";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const deal = await getDeal(user.workspaceId, id);

  if (!deal) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deal detail"
        title={deal.title}
        description={deal.contact ? `${deal.contact.name} • ${deal.company?.name ?? "Independent opportunity"}` : deal.company?.name ?? "Independent opportunity"}
        actions={
          <>
            <Link href={`/deals/${deal.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <DeleteButton endpoint={`/api/deals/${deal.id}`} redirectTo="/deals" label="deal" />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <p className="text-sm font-semibold text-ink">Deal summary</p>
                <p className="mt-1 text-sm text-slate-500">The commercial shape and next movement.</p>
              </div>
              <DealStageBadge stage={deal.stage} />
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Value" value={formatCurrency(deal.amount, deal.currency)} />
                <Info label="Expected close" value={deal.expectedCloseDate ? formatDateTime(deal.expectedCloseDate) : "Not set"} />
                <Info label="Contact" value={deal.contact?.name ?? "Not linked"} />
                <Info label="Company" value={deal.company?.name ?? "Not linked"} />
              </div>
              <div className="rounded-3xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Next step</p>
                <p className="mt-2 text-sm text-slate-700">{deal.nextStep ?? "No next step set yet"}</p>
              </div>
              <div className="rounded-3xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Description</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{deal.description ?? "No notes added yet."}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <p className="text-sm font-semibold text-ink">Notes</p>
                <p className="mt-1 text-sm text-slate-500">Capture what changed, what matters, and what to watch for.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <NoteForm endpoint={`/api/deals/${deal.id}/notes`} placeholder="What happened in the latest conversation or proposal review?" />
              <div className="space-y-3">
                {deal.notes.map((note) => (
                  <div key={note.id} className="rounded-3xl border border-black/5 bg-white p-4">
                    <p className="text-sm leading-6 text-slate-700">{note.content}</p>
                    <p className="mt-3 text-xs text-slate-400">{formatDateTime(note.createdAt)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <p className="text-sm font-semibold text-ink">Linked tasks</p>
                <p className="mt-1 text-sm text-slate-500">Follow-ups connected to this opportunity.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {deal.tasks.map((task) => (
                <div key={task.id} className="rounded-3xl border border-black/5 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-ink">{task.title}</p>
                    <div className="flex items-center gap-2">
                      <TaskPriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <p className="text-sm font-semibold text-ink">Activity timeline</p>
                <p className="mt-1 text-sm text-slate-500">Every meaningful move on the deal in chronological order.</p>
              </div>
            </CardHeader>
            <CardContent>
              <ActivityList activities={deal.activities} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm text-slate-700">{value}</p>
    </div>
  );
}
