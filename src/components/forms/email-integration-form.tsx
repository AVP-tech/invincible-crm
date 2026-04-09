"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailConfigSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.coerce.number().min(1).max(65535).default(993),
  secure: z.boolean().default(true),
  username: z.string().email("Valid email required"),
  password: z.string().min(1, "Password/App Password is required"),
  mailbox: z.string().default("INBOX")
});

type EmailConfigValues = z.infer<typeof emailConfigSchema>;

export function EmailIntegrationForm() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  const form = useForm<any>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      username: "",
      password: "",
      mailbox: "INBOX"
    }
  });

  const onSubmit = async (values: any) => {
    try {
      const res = await fetch("/api/integrations/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to connect email");
        return;
      }

      toast.success("IMAP Credentials saved successfully!");
      handleSync();
    } catch (e: any) {
      toast.error("Internal Server Error");
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncedCount(null);
    try {
      const res = await fetch("/api/integrations/email/sync", { method: "POST" });
      if (!res.ok) {
        toast.error("Failed to sync emails.");
        return;
      }
      
      const data = await res.json();
      setSyncedCount(data.syncedCount ?? 0);
      toast.success(`Successfully synced ${data.syncedCount ?? 0} emails.`);
    } catch (e: any) {
      toast.error("An error occurred during sync.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">IMAP Host</label>
            <Input {...form.register("host")} placeholder="imap.gmail.com" />
            {form.formState.errors.host && <p className="text-xs text-rose-500">{form.formState.errors.host.message as string}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Email Username</label>
            <Input type="email" {...form.register("username")} placeholder="you@company.com" />
            {form.formState.errors.username && <p className="text-xs text-rose-500">{form.formState.errors.username.message as string}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">App Password</label>
            <Input type="password" {...form.register("password")} placeholder="••••••••" />
            {form.formState.errors.password && <p className="text-xs text-rose-500">{form.formState.errors.password.message as string}</p>}
            <p className="text-xs text-slate-500">Requires an app-specific password, not your main password.</p>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting ? "Connecting..." : "Save Connection"}
        </Button>
      </form>

      <div className="mt-8 rounded-2xl border border-moss/20 bg-moss/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-medium text-moss">Background Sync</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {syncedCount !== null ? `Last sync pulled ${syncedCount} new emails.` : "Pull recent emails into the CRM using the connection above."}
          </p>
        </div>
        <Button 
          variant="secondary" 
          onClick={handleSync} 
          disabled={isSyncing}
          className="shrink-0 gap-2 border-moss/20 text-moss hover:bg-moss/10"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? "Syncing Inbox..." : "Manual Sync"}
        </Button>
      </div>
    </div>
  );
}
