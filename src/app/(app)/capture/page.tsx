import { CaptureForm } from "@/components/forms/capture-form";
import { PageHeader } from "@/components/ui/page-header";

export default function CapturePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI capture"
        title="From plain language to structured CRM updates"
        description="Type exactly what happened. We will draft the contact, deal, task, and note changes so you can confirm before anything is written."
      />
      <CaptureForm />
    </div>
  );
}
