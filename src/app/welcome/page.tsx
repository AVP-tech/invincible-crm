import { redirect } from "next/navigation";
import { ArrowRight, Sparkles, CheckSquare, KanbanSquare } from "lucide-react";
import { CompleteOnboardingButton } from "@/components/complete-onboarding-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export default async function WelcomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-moss">Welcome</p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-ink lg:text-6xl">
              This workspace is built to feel like memory support, not admin software.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-slate-600">
              Capture conversations in plain English, keep follow-ups visible, and let the CRM turn small daily notes into reliable deal momentum.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <CompleteOnboardingButton />
              <p className="flex items-center gap-2 text-sm text-slate-500">
                Enter your seeded demo workspace
                <ArrowRight className="h-4 w-4" />
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {[
            [Sparkles, "Quick capture first", "Type updates like a message and confirm the CRM preview before it saves."],
            [KanbanSquare, "Pipeline clarity", "See active deals by stage without navigating through enterprise-style setup."],
            [CheckSquare, "Follow-ups stay visible", "Today, upcoming, overdue, and completed tasks live in one calm workflow."]
          ].map(([Icon, title, description]) => {
            const FeatureIcon = Icon as typeof Sparkles;

            return (
              <Card key={title as string}>
                <CardHeader>
                  <div className="rounded-2xl bg-moss/10 p-2 text-moss">
                    <FeatureIcon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h2 className="text-xl font-semibold text-ink">{title as string}</h2>
                  <p className="mt-2 text-sm text-slate-600">{description as string}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
