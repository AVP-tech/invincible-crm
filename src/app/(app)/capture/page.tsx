import type { Metadata } from "next";
import { CaptureForm } from "@/components/forms/capture-form";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Quick Capture",
  description: "Describe what happened in plain language. Invincible CRM extracts contacts, deals, tasks, and notes before anything is saved.",
  openGraph: {
    title: "Quick Capture | Invincible CRM",
    description: "Describe what happened in plain language. Invincible CRM extracts contacts, deals, tasks, and notes before anything is saved."
  }
};

export default function CapturePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI capture"
        title="Your CRM updates itself — just talk."
        description="Describe what happened in plain language. Invincible CRM extracts contacts, deals, tasks, and notes — ready for your review before anything is saved."
      />
      <p className="text-sm font-medium text-moss">Built for Indian freelancers and small agencies</p>
      <CaptureForm />
    </div>
  );
}
