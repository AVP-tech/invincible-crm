import Link from "next/link";
import { FileText, Upload, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const options = [
  {
    href: "/imports/transcript",
    title: "Meeting transcript import",
    description: "Turn pasted call notes or transcripts into a clean summary, follow-up task, and deal/contact updates.",
    icon: FileText
  },
  {
    href: "/imports/contacts",
    title: "CSV contacts import",
    description: "Bring spreadsheet contacts into the CRM with preview and dedupe checks before anything is written.",
    icon: Upload
  }
];

export default function ImportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Imports"
        title="Move real business data into the workspace"
        description="These flows are meant to reduce migration friction and make the CRM useful with real spreadsheets and meeting notes, not just manual entry."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <Link key={option.href} href={option.href}>
              <Card className="h-full transition hover:-translate-y-0.5">
                <CardHeader>
                  <div className="rounded-2xl bg-moss/10 p-2 text-moss">
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h2 className="text-xl font-semibold text-ink">{option.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-ink">
                    Open import flow
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
