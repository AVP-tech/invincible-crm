import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { toArray } from "@/lib/utils";
import { getContact } from "@/features/contacts/service";
import { ContactForm } from "@/components/forms/contact-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const contact = await getContact(user.workspaceId, id);

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contacts"
        title={`Edit ${contact.name}`}
        description="Update just the context you need. The point is staying useful, not collecting fields for their own sake."
      />

      <Card>
        <CardHeader />
        <CardContent className="pt-0">
          <ContactForm
            mode="edit"
            contactId={contact.id}
            defaultValues={{
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
              companyName: contact.company?.name,
              source: contact.source,
              tagsText: toArray(contact.tags as string[] | undefined).join(", ")
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
