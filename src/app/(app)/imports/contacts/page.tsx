import { ContactCsvImportForm } from "@/components/forms/contact-csv-import-form";
import { PageHeader } from "@/components/ui/page-header";

export default function ContactImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Imports"
        title="Import contacts from CSV"
        description="Bring spreadsheet contacts into the CRM with a preview step that checks for duplicates before applying changes."
      />
      <ContactCsvImportForm />
    </div>
  );
}
