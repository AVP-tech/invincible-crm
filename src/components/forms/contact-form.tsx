"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { contactInputSchema, type ContactInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ContactFormProps = {
  mode: "create" | "edit";
  contactId?: string;
  defaultValues?: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    companyName?: string | null;
    source?: string | null;
    tagsText?: string;
  };
};

export function ContactForm({ mode, contactId, defaultValues }: ContactFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.input<typeof contactInputSchema>, unknown, ContactInput>({
    resolver: zodResolver(contactInputSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      companyName: defaultValues?.companyName ?? "",
      source: defaultValues?.source ?? "",
      tagsText: defaultValues?.tagsText ?? ""
    }
  });

  async function onSubmit(values: ContactInput) {
    setIsSubmitting(true);

    const response = await fetch(mode === "create" ? "/api/contacts" : `/api/contacts/${contactId}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not save contact");
      return;
    }

    toast.success(mode === "create" ? "Contact created" : "Contact updated");
    router.push(mode === "create" ? `/contacts/${payload.contact.id}` : `/contacts/${contactId}`);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" error={String(form.formState.errors.name?.message ?? "")}>
          <Input placeholder="Rahul Verma" {...form.register("name")} />
        </Field>
        <Field label="Email" error={String(form.formState.errors.email?.message ?? "")}>
          <Input placeholder="rahul@company.com" {...form.register("email")} />
        </Field>
        <Field label="Phone">
          <Input placeholder="+91 98765 43210" {...form.register("phone")} />
        </Field>
        <Field label="Company">
          <Input placeholder="Northline Fitness" {...form.register("companyName")} />
        </Field>
        <Field label="Source">
          <Input placeholder="Referral, WhatsApp, Instagram..." {...form.register("source")} />
        </Field>
        <Field label="Tags">
          <Input placeholder="Warm lead, Design, Follow-up" {...form.register("tagsText")} />
        </Field>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create contact" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </label>
  );
}
