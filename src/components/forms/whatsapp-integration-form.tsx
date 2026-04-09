"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { whatsappIntegrationInputSchema, type WhatsappIntegrationInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WhatsappIntegrationForm() {
  const form = useForm<any>({
    resolver: zodResolver(whatsappIntegrationInputSchema),
    defaultValues: {
      name: "Primary WhatsApp",
      phoneNumberId: "",
      verifyToken: "secret_verify_token_123",
      accessToken: ""
    }
  });

  const onSubmit = async (values: any) => {
    try {
      const res = await fetch("/api/integrations/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to configure WhatsApp");
        return;
      }

      toast.success("WhatsApp Meta credentials saved successfully!");
    } catch (e: any) {
      toast.error("Internal Server Error");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Connection Name</label>
            <Input {...form.register("name")} placeholder="Primary WhatsApp" />
            {form.formState.errors.name && <p className="text-xs text-rose-500">{form.formState.errors.name.message as string}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Phone Number ID</label>
            <Input {...form.register("phoneNumberId")} placeholder="1234567890" />
            {form.formState.errors.phoneNumberId && <p className="text-xs text-rose-500">{form.formState.errors.phoneNumberId.message as string}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Verify Token</label>
            <Input type="password" {...form.register("verifyToken")} placeholder="MySecretToken" />
            {form.formState.errors.verifyToken && <p className="text-xs text-rose-500">{form.formState.errors.verifyToken.message as string}</p>}
            <p className="text-xs text-slate-500">Provide this to Meta during Webhook setup.</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Meta Access Token (Optional)</label>
            <Input type="password" {...form.register("accessToken")} placeholder="EAxxxxx..." />
            {form.formState.errors.accessToken && <p className="text-xs text-rose-500">{form.formState.errors.accessToken.message as string}</p>}
            <p className="text-xs text-slate-500">Only needed if sending outbound replies.</p>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting ? "Saving Config..." : "Save Connection"}
        </Button>
      </form>

      <div className="mt-8 rounded-2xl border border-moss/20 bg-moss/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-medium text-moss">Webhook URL</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
            https://your-domain.com/api/webhooks/whatsapp
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Paste this URL inside your Meta App Dashboard under WhatsApp &gt; Configuration. Use the Verify Token you set above.
          </p>
        </div>
      </div>
    </div>
  );
}
