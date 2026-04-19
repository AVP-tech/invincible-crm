import { PricingSection } from "@/components/marketing/pricing-section";
import { PageHeader } from "@/components/ui/page-header";

export default function UpgradePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Upgrade"
        title="Scale your CRM without limits"
        description="Choose the plan that fits your ambition. Upgrading gives you priority support and unlimited workflows."
      />
      <div className="rounded-3xl bg-[#03060d]">
        <PricingSection />
      </div>
    </div>
  );
}
