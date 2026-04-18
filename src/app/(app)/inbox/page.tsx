import Link from "next/link";
import { MessageSquareMore } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { listRecentInboxCaptures } from "@/features/inbox/service";
import { InboxCaptureForm } from "@/components/forms/inbox-capture-form";
import { ConversationSourceBadge } from "@/components/status-badges";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function InboxPage() {
  const user = await requireUser();
  const recentCaptures = await listRecentInboxCaptures(user.workspaceId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Capture the conversations that usually live outside the CRM"
        description="Paste WhatsApp chats, email threads, or rough call notes and convert them into clean CRM context with action-ready follow-ups."
      />

      <InboxCaptureForm />

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-moss/10 p-2 text-moss">
              <MessageSquareMore className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-ink">Recent inbox captures</p>
              <p className="mt-1 text-sm text-slate-500">A lightweight audit trail of the conversations that were turned into CRM updates.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentCaptures.length ? (
            recentCaptures.map((capture) => (
              <div key={capture.id} className="rounded-3xl border border-black/5 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{capture.subject ?? capture.participantLabel ?? "Conversation capture"}</p>
                  <ConversationSourceBadge source={capture.source} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{capture.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{formatDateTime(capture.createdAt)}</span>
                  {capture.contactId ? <Link href={`/contacts/${capture.contactId}`} className="font-medium text-moss">Open contact</Link> : null}
                  {capture.dealId ? <Link href={`/deals/${capture.dealId}`} className="font-medium text-moss">Open deal</Link> : null}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No inbox captures yet"
              description="Paste one real conversation above and the CRM will turn it into a calm summary, a note, and the next follow-up."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
