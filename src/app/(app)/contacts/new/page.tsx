import { ContactForm } from "@/components/forms/contact-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function NewContactPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contacts"
        title="Add a contact"
        description="Keep this lightweight. You only need enough context to remember who they are and why they matter."
      />

      <Card>
        <CardHeader />
        <CardContent className="pt-0">
          <ContactForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
