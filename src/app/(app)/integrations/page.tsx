import { headers } from "next/headers";
import { IntegrationProvider } from "@prisma/client";
import { requireUser, canManageWorkspace } from "@/lib/auth";
import {
  listIntegrationConnections,
  sanitizeEmailConnectionConfig,
  sanitizeWhatsappConnectionConfig,
} from "@/features/integrations/service";
import { listBackgroundJobs } from "@/features/jobs/service";
import { IntegrationSettingsForm } from "@/components/forms/integration-settings-form";
import { IntegrationJobsPanel } from "@/components/integration-jobs-panel";
import { PageHeader } from "@/components/ui/page-header";
import { env } from "@/lib/env";

function resolveAppUrl(headerStore: Awaited<ReturnType<typeof headers>>) {
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");

  if (host) {
    return `${protocol}://${host}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "";
}

export default async function IntegrationsPage() {
  const user = await requireUser();
  const headerStore = await headers();
  const appUrl = resolveAppUrl(headerStore);
  const connections = await listIntegrationConnections(user.workspaceId);
  const jobs = await listBackgroundJobs(user.workspaceId);
  const canManage = canManageWorkspace(user);
  const email = connections.find((connection) => connection.provider === IntegrationProvider.EMAIL_IMAP);
  const whatsapp = connections.find((connection) => connection.provider === IntegrationProvider.WHATSAPP_META);
  const serializedJobs = jobs.map((job) => ({
    id: job.id,
    type: job.type,
    status: job.status,
    attempts: job.attempts,
    lastError: job.lastError,
    scheduledFor: job.scheduledFor.toISOString(),
    startedAt: job.startedAt?.toISOString() ?? null,
    finishedAt: job.finishedAt?.toISOString() ?? null,
    integrationConnectionName: job.integrationConnection?.name ?? null
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Integrations"
        title="Connect the tools where real conversations already happen"
        description="This is the bridge from manual CRM updates to operational capture: email inboxes, WhatsApp messages, and background processing."
      />

      <IntegrationSettingsForm
        canManage={canManage}
        webhookUrl={appUrl ? `${appUrl}/api/webhooks/whatsapp` : "/api/webhooks/whatsapp"}
        emailDefaults={
          email
            ? {
                name: email.name,
                ...sanitizeEmailConnectionConfig(email.config),
                status: email.status,
                lastSyncMessage: email.lastSyncMessage,
                lastSyncedAt: email.lastSyncedAt?.toISOString() ?? null,
              }
            : undefined
        }
        whatsappDefaults={
          whatsapp
            ? {
                name: whatsapp.name,
                ...sanitizeWhatsappConnectionConfig(whatsapp.config),
                status: whatsapp.status,
                lastSyncMessage: whatsapp.lastSyncMessage,
                lastSyncedAt: whatsapp.lastSyncedAt?.toISOString() ?? null,
              }
            : undefined
        }
        webhookSecurityEnabled={Boolean(env.whatsappAppSecret)}
      />

      <IntegrationJobsPanel canManage={canManage} jobs={serializedJobs} />
    </div>
  );
}
