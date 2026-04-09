"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { profileInputSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProfileFormProps = {
  defaultValues: {
    name: string;
    email: string;
  };
};

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(profileInputSchema),
    defaultValues: {
      name: defaultValues.name,
      email: defaultValues.email,
      currentPassword: "",
      newPassword: ""
    }
  });

  async function onSubmit(values: Record<string, string>) {
    setIsSubmitting(true);
    const response = await fetch("/api/settings/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });
    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not update profile");
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" error={String(form.formState.errors.name?.message ?? "")}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="Email" error={String(form.formState.errors.email?.message ?? "")}>
          <Input {...form.register("email")} />
        </Field>
        <Field label="Current password">
          <Input type="password" {...form.register("currentPassword")} />
        </Field>
        <Field label="New password">
          <Input type="password" {...form.register("newPassword")} />
        </Field>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save profile"}
      </Button>
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
