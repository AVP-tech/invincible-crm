import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { toArray } from "@/lib/utils";
import { listContacts } from "@/features/contacts/service";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

export default async function ContactsPage() {
  const user = await requireUser();
  const contacts = await listContacts(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contacts"
        title="People and companies that matter"
        description="Keep customer context simple: one place for notes, active work, and relationship history."
        actions={
          <Link href="/contacts/new">
            <Button>New contact</Button>
          </Link>
        }
      />

      {contacts.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {contacts.map((contact) => (
            <Link key={contact.id} href={`/contacts/${contact.id}`}>
              <Card className="h-full transition hover:-translate-y-0.5">
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar name={contact.name} email={contact.email} />
                      <div>
                        <h2 className="text-xl font-semibold text-ink">{contact.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {contact.company?.name ?? "Independent contact"} {contact.source ? `• ${contact.source}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <p>{contact.deals.length} deals</p>
                      <p>{contact.tasks.length} tasks</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {toArray(contact.tags as string[] | undefined).length ? (
                      toArray(contact.tags as string[] | undefined).map((tag) => (
                        <Badge key={tag} className="bg-sand text-ink">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500">No tags yet</Badge>
                    )}
                  </div>

                  <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <p>{contact.email ?? "No email saved"}</p>
                    <p>{contact.phone ?? "No phone saved"}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Start your contact book with the people you actually need to follow up with"
          description="You can add a contact manually or let quick capture create one from a sentence like “Met Priya from ABC Studio today.”"
          actionHref="/contacts/new"
          actionLabel="Create first contact"
        />
      )}
    </div>
  );
}
