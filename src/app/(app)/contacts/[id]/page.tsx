import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { toArray, formatDateTime } from "@/lib/utils";
import { getContact } from "@/features/contacts/service";
import { ActivityList } from "@/components/activity-list";
import { DeleteButton } from "@/components/delete-button";
import { NoteForm } from "@/components/forms/note-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ConversationSourceBadge, DealStageBadge, TaskPriorityBadge, TaskRecurrenceBadge, TaskStatusBadge } from "@/components/status-badges";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const contact = await getContact(user.workspaceId, id);

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contact detail"
        title={contact.name}
        description={`${contact.company?.name ?? "Independent contact"}${contact.source ? ` • Source: ${contact.source}` : ""}`}
        actions={
          <>
            <Link href={`/contacts/${contact.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <DeleteButton endpoint={`/api/contacts/${contact.id}`} redirectTo="/contacts" label="contact" />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <p className="text-sm font-semibold text-ink">Profile</p>
                <p className="mt-1 text-sm text-slate-500">Core context for this relationship.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Email" value={contact.email ?? "Not saved"} />
                <Info label="Phone" value={contact.phone ?? "Not saved"} />
                <Info label="Company" value={contact.company?.name ?? "Independent"} />
                <Info label="Created" value={formatDateTime(contact.createdAt)} />
              </div>
              <div className="flex flex-wrap gap-2">
                {toArray(contact.tags as string[] | undefined).map((tag) => (
                  <Badge key={tag} className="bg-sand text-ink">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <p className="text-sm font-semibold text-ink">Notes</p>
                <p className="mt-1 text-sm text-slate-500">Keep the texture of conversations, not just the data points.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <NoteForm endpoint={`/api/contacts/${contact.id}/notes`} placeholder="Write the meeting summary, concerns, next commitments, or useful context..." />
              <div className="space-y-3">
                {contact.notes.map((note) => (
                  <div key={note.id} className="rounded-3xl border border-black/5 bg-white p-4">
                    <p className="text-sm leading-6 text-slate-700">{note.content}</p>
                    <p className="mt-3 text-xs text-slate-400">{formatDateTime(note.createdAt)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <p className="text-sm font-semibold text-ink">Recent conversations</p>
                <p className="mt-1 text-sm text-slate-500">WhatsApp and email captures stay attached to the relationship, not buried elsewhere.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.conversationLogs.length ? (
                contact.conversationLogs.map((conversation) => (
                  <div key={conversation.id} className="rounded-3xl border border-black/5 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{conversation.subject ?? conversation.participantLabel ?? "Conversation capture"}</p>
                      <ConversationSourceBadge source={conversation.source} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{conversation.summary}</p>
                    <p className="mt-3 text-xs text-slate-400">{formatDateTime(conversation.createdAt)}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600">
                  No captured conversations yet. Use Inbox to turn WhatsApp chats or email threads into CRM-ready notes and actions.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <p className="text-sm font-semibold text-ink">Open work</p>
                <p className="mt-1 text-sm text-slate-500">Deals and tasks linked to this contact.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.deals.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="block rounded-3xl border border-black/5 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{deal.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{deal.nextStep ?? "No next step set yet"}</p>
                    </div>
                    <DealStageBadge stage={deal.stage} />
                  </div>
                </Link>
              ))}

              {contact.tasks.map((task) => (
                <div key={task.id} className="rounded-3xl border border-black/5 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-ink">{task.title}</p>
                    <div className="flex items-center gap-2">
                      <TaskPriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                      <TaskRecurrenceBadge pattern={task.recurrencePattern} intervalDays={task.recurrenceIntervalDays} />
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
                <p className="mt-1 text-sm text-slate-500">Every meaningful change stays visible.</p>
              </div>
            </CardHeader>
            <CardContent>
              <ActivityList activities={contact.activities} />
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
