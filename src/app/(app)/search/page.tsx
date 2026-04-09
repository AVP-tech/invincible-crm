import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDueLabel } from "@/lib/utils";
import { globalSearch } from "@/features/search/service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ConversationSourceBadge, DealStageBadge, TaskPriorityBadge, TaskStatusBadge } from "@/components/status-badges";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const query = params.q ?? "";
  const results = await globalSearch(user.id, query);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Search"
        title="Find context fast"
        description="Search across contacts, deals, tasks, and captured conversations from one place."
      />

      {!query ? (
        <EmptyState title="Search the workspace" description="Try a name, company, deal title, task phrase, or next step." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <p className="font-semibold text-ink">Contacts</p>
                <p className="mt-1 text-sm text-slate-500">{results.contacts.length} matches</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.contacts.map((contact) => (
                <Link key={contact.id} href={`/contacts/${contact.id}`} className="block rounded-3xl border border-black/5 bg-white p-4">
                  <p className="font-semibold text-ink">{contact.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{contact.company?.name ?? "Independent contact"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(contact.tags as string[] | null)?.map((tag) => (
                      <Badge key={tag} className="bg-sand text-ink">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <p className="font-semibold text-ink">Deals</p>
                <p className="mt-1 text-sm text-slate-500">{results.deals.length} matches</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.deals.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="block rounded-3xl border border-black/5 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink">{deal.title}</p>
                    <DealStageBadge stage={deal.stage} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{deal.contact?.name ?? "No contact linked"}</p>
                  <p className="mt-3 text-sm text-slate-600">{formatCurrency(deal.amount, deal.currency)}</p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <p className="font-semibold text-ink">Tasks</p>
                <p className="mt-1 text-sm text-slate-500">{results.tasks.length} matches</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.tasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}/edit`} className="block rounded-3xl border border-black/5 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{task.title}</p>
                    <TaskPriorityBadge priority={task.priority} />
                    <TaskStatusBadge status={task.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{task.contact?.name ?? "No contact linked"}</p>
                  <p className="mt-3 text-sm text-slate-600">{formatDueLabel(task.dueDate)}</p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <p className="font-semibold text-ink">Conversations</p>
                <p className="mt-1 text-sm text-slate-500">{results.conversations.length} matches</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.conversations.map((conversation) => (
                <Link key={conversation.id} href={conversation.contactId ? `/contacts/${conversation.contactId}` : "/inbox"} className="block rounded-3xl border border-black/5 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink">{conversation.subject ?? conversation.participantLabel ?? "Conversation capture"}</p>
                    <ConversationSourceBadge source={conversation.source} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{conversation.contact?.name ?? conversation.deal?.title ?? "Inbox conversation"}</p>
                  <p className="mt-3 text-sm text-slate-600">{conversation.summary}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
