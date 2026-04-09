import { TranscriptImportForm } from "@/components/forms/transcript-import-form";
import { PageHeader } from "@/components/ui/page-header";

export default function TranscriptImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Imports"
        title="Import meeting transcripts"
        description="Paste a real call, meeting, or handoff transcript and convert it into CRM-ready notes, follow-ups, and opportunity updates."
      />
      <TranscriptImportForm />
    </div>
  );
}
