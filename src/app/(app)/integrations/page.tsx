import { IntegrationProvider } from "@prisma/client";
import { requireUser, canManageWorkspace } from "@/lib/auth";
import { listIntegrationConnections } from "@/features/integrations/service";
import { listBackgroundJobs } from "@/features/jobs/service";
import { IntegrationSettingsForm } from "@/components/forms/integration-settings-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function IntegrationsPage() {
  const user = await requireUser();
  const connections = await listIntegrationConnections(user.workspaceId);
  const jobs = await listBackgroundJobs(user.workspaceId);
  const canManage = canManageWorkspace(user);
  const email = connections.find((connection) => connection.provider === IntegrationProvider.EMAIL_IMAP);
  const whatsapp = connections.find((connection) => connection.provider === IntegrationProvider.WHATSAPP_META);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Integrations"
        title="Connect the tools where real conversations already happen"
        description="This is the bridge from manual CRM updates to operational capture: email inboxes, WhatsApp messages, and background processing."
      />

      <IntegrationSettingsForm
        canManage={canManage}
        emailDefaults={
          email
            ? {
                ...(email.config as Record<string, string | number | boolean>),
                status: email.status,
                lastSyncMessage: email.lastSyncMessage
              }
            : undefined
        }
        whatsappDefaults={
          whatsapp
            ? {
                ...(whatsapp.config as Record<string, string | number | boolean>),
                status: whatsapp.status,
                lastSyncMessage: whatsapp.lastSyncMessage
              }
            : undefined
        }
      />

      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold text-ink">Recent jobs</p>
            <p className="mt-1 text-sm text-slate-500">Background processing keeps syncs and webhook work from blocking the UI.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.length ? (
            jobs.map((job) => (
              <div key={job.id} className="rounded-3xl border border-black/5 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{job.type.replaceAll("_", " ")}</p>
                  <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">{job.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{job.integrationConnection?.name ?? "Workspace job"}</p>
                {job.lastError ? <p className="mt-3 text-sm text-rose-600">{job.lastError}</p> : null}
              </div>
            ))
          ) : (
            <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600">No background jobs have run yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
