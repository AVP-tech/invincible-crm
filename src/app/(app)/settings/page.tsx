import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { ProfileForm } from "@/components/forms/profile-form";
import { EmailIntegrationForm } from "@/components/forms/email-integration-form";
import { WhatsappIntegrationForm } from "@/components/forms/whatsapp-integration-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace basics"
        description="Keep auth simple, profile details current, and be explicit about whether AI capture is running in fallback or OpenAI mode."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold text-ink">Profile</p>
              <p className="mt-1 text-sm text-slate-500">Update your account details and optionally rotate your password.</p>
            </div>
          </CardHeader>
          <CardContent>
            <ProfileForm defaultValues={{ name: user.name, email: user.email }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold text-ink">AI mode</p>
              <p className="mt-1 text-sm text-slate-500">How quick capture behaves in this local environment.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="rounded-3xl bg-white p-4">
              <p className="font-semibold text-ink">{env.openAiApiKey ? "OpenAI enabled" : "Fallback parser enabled"}</p>
              <p className="mt-2">
                {env.openAiApiKey
                  ? "Quick capture will try OpenAI first, then fall back to deterministic parsing if validation fails."
                  : "No OPENAI_API_KEY was found, so the app still works using the built-in deterministic parser for common commands."}
              </p>
            </div>
            <div className="rounded-3xl bg-white p-4">
              <p className="font-semibold text-ink">Demo account</p>
              <p className="mt-2">{env.demoUserEmail}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="hover:border-moss/30 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-2 dark:bg-white/10">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Automations Engine</p>
                  <p className="mt-1 text-sm text-slate-500">Construct &quot;If This, Then That&quot; rules to automate routine tasks and documentation.</p>
                </div>
              </div>
              <Link href="/automations">
                <Button variant="secondary">Manage Rules</Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-2 dark:bg-white/10">
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Two-Way Email Sync (IMAP)</p>
                <p className="mt-1 text-sm text-slate-500">Connect your inbox to automatically parse emails and attach them to client timelines.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <EmailIntegrationForm />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-green-500/10 p-2 dark:bg-green-500/20">
                <svg className="h-5 w-5 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">WhatsApp Webhooks (Meta)</p>
                <p className="mt-1 text-sm text-slate-500">Enable live forwarding of client WhatsApp messages directly onto their CRM profiles.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WhatsappIntegrationForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
