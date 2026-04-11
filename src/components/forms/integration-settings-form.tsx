"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type IntegrationSettingsFormProps = {
  canManage: boolean;
  webhookUrl: string;
  emailDefaults?: {
    name?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    mailbox?: string;
    hasPassword?: boolean;
    status?: string;
    lastSyncMessage?: string | null;
  };
  whatsappDefaults?: {
    name?: string;
    phoneNumberId?: string;
    verifyToken?: string;
    hasAccessToken?: boolean;
    status?: string;
    lastSyncMessage?: string | null;
  };
};

export function IntegrationSettingsForm({ canManage, webhookUrl, emailDefaults, whatsappDefaults }: IntegrationSettingsFormProps) {
  const router = useRouter();
  const [emailName, setEmailName] = useState(emailDefaults?.name ?? "Primary inbox");
  const [host, setHost] = useState(emailDefaults?.host ?? "");
  const [port, setPort] = useState(String(emailDefaults?.port ?? 993));
  const [secure, setSecure] = useState(emailDefaults?.secure ?? true);
  const [username, setUsername] = useState(emailDefaults?.username ?? "");
  const [password, setPassword] = useState("");
  const [mailbox, setMailbox] = useState(emailDefaults?.mailbox ?? "INBOX");
  const [whatsappName, setWhatsappName] = useState(whatsappDefaults?.name ?? "Primary WhatsApp");
  const [phoneNumberId, setPhoneNumberId] = useState(whatsappDefaults?.phoneNumberId ?? "");
  const [verifyToken, setVerifyToken] = useState(whatsappDefaults?.verifyToken ?? "");
  const [accessToken, setAccessToken] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const [isSyncingEmail, setIsSyncingEmail] = useState(false);
  const [isProcessingJobs, setIsProcessingJobs] = useState(false);
  const webhookPath = useMemo(() => webhookUrl, [webhookUrl]);

  async function saveEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingEmail(true);
    const response = await fetch("/api/integrations/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: emailName,
        host,
        port,
        secure,
        username,
        password,
        mailbox
      })
    });
    const payload = await response.json();
    setIsSavingEmail(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not save email integration");
      return;
    }

    toast.success("Email integration saved");
    setPassword("");
    router.refresh();
  }

  async function syncEmail() {
    setIsSyncingEmail(true);
    const response = await fetch("/api/integrations/email/sync", {
      method: "POST"
    });
    const payload = await response.json();
    setIsSyncingEmail(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not sync email");
      return;
    }

    toast.success("Email sync queued");
    router.refresh();
  }

  async function saveWhatsapp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingWhatsapp(true);
    const response = await fetch("/api/integrations/whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: whatsappName,
        phoneNumberId,
        verifyToken,
        accessToken
      })
    });
    const payload = await response.json();
    setIsSavingWhatsapp(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not save WhatsApp integration");
      return;
    }

    toast.success("WhatsApp integration saved");
    setAccessToken("");
    router.refresh();
  }

  async function processJobs() {
    setIsProcessingJobs(true);
    const response = await fetch("/api/jobs/process", {
      method: "POST"
    });
    const payload = await response.json();
    setIsProcessingJobs(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not process jobs");
      return;
    }

    toast.success(`Processed ${payload.processed ?? 0} job(s)`);
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form className="space-y-4 rounded-4xl border border-black/5 bg-white p-6" onSubmit={saveEmail}>
        <div>
          <p className="text-lg font-semibold text-ink">Email sync</p>
          <p className="mt-1 text-sm text-slate-500">Connect a shared mailbox over IMAP and pull fresh email context into the CRM.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Connection name">
            <Input value={emailName} onChange={(event) => setEmailName(event.target.value)} disabled={!canManage} />
          </Field>
          <Field label="Mailbox">
            <Input value={mailbox} onChange={(event) => setMailbox(event.target.value)} disabled={!canManage} />
          </Field>
          <Field label="IMAP host">
            <Input value={host} onChange={(event) => setHost(event.target.value)} disabled={!canManage} placeholder="imap.gmail.com" />
          </Field>
          <Field label="Port">
            <Input type="number" value={port} onChange={(event) => setPort(event.target.value)} disabled={!canManage} />
          </Field>
          <Field label="Username">
            <Input value={username} onChange={(event) => setUsername(event.target.value)} disabled={!canManage} />
          </Field>
          <Field label="Password / app password">
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!canManage}
              placeholder={emailDefaults?.hasPassword ? "Leave blank to keep the saved app password" : "Enter your IMAP or app password"}
            />
            <p className="text-xs text-slate-500">
              {emailDefaults?.hasPassword ? "A password is already saved. Only fill this if you want to replace it." : "Use an app password when your provider requires one."}
            </p>
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={secure} onChange={(event) => setSecure(event.target.checked)} disabled={!canManage} />
          Use TLS / secure IMAP
        </label>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={!canManage || isSavingEmail}>
            {isSavingEmail ? "Saving..." : "Save email integration"}
          </Button>
          <Button type="button" variant="secondary" onClick={syncEmail} disabled={!canManage || isSyncingEmail}>
            {isSyncingEmail ? "Syncing..." : "Run email sync"}
          </Button>
        </div>
        <p className="text-xs text-slate-500">Saving now verifies the mailbox before it is marked connected.</p>
        {emailDefaults?.status ? <p className="text-sm text-slate-500">Status: {emailDefaults.status}</p> : null}
        {emailDefaults?.lastSyncMessage ? <p className="text-sm text-slate-500">{emailDefaults.lastSyncMessage}</p> : null}
      </form>

      <form className="space-y-4 rounded-4xl border border-black/5 bg-white p-6" onSubmit={saveWhatsapp}>
        <div>
          <p className="text-lg font-semibold text-ink">WhatsApp sync</p>
          <p className="mt-1 text-sm text-slate-500">Use the Meta webhook path below to ingest incoming WhatsApp messages into the CRM automatically.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Connection name">
            <Input value={whatsappName} onChange={(event) => setWhatsappName(event.target.value)} disabled={!canManage} />
          </Field>
          <Field label="Phone number id">
            <Input value={phoneNumberId} onChange={(event) => setPhoneNumberId(event.target.value)} disabled={!canManage} />
          </Field>
          <Field label="Verify token">
            <Input value={verifyToken} onChange={(event) => setVerifyToken(event.target.value)} disabled={!canManage} />
          </Field>
          <Field label="Access token">
            <Input
              type="password"
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
              disabled={!canManage}
              placeholder={whatsappDefaults?.hasAccessToken ? "Leave blank to keep the saved access token" : "Optional but recommended for Meta validation"}
            />
            <p className="text-xs text-slate-500">
              {whatsappDefaults?.hasAccessToken ? "An access token is already saved. Enter a new one only if you want to rotate it." : "If you add a token, we can verify the phone number ID with Meta while saving."}
            </p>
          </Field>
        </div>
        <Field label="Webhook URL">
          <Textarea value={webhookPath} readOnly className="min-h-[96px]" />
        </Field>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={!canManage || isSavingWhatsapp}>
            {isSavingWhatsapp ? "Saving..." : "Save WhatsApp integration"}
          </Button>
          <Button type="button" variant="secondary" onClick={processJobs} disabled={!canManage || isProcessingJobs}>
            {isProcessingJobs ? "Processing..." : "Process queued jobs"}
          </Button>
        </div>
        <p className="text-xs text-slate-500">Paste this exact URL into your Meta app webhook settings, then subscribe the WhatsApp message events.</p>
        {whatsappDefaults?.status ? <p className="text-sm text-slate-500">Status: {whatsappDefaults.status}</p> : null}
        {whatsappDefaults?.lastSyncMessage ? <p className="text-sm text-slate-500">{whatsappDefaults.lastSyncMessage}</p> : null}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
