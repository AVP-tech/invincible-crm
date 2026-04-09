"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceRole } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function TeamMemberForm({ canManage }: { canManage: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<WorkspaceRole>(WorkspaceRole.MEMBER);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const response = await fetch("/api/team/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role
      })
    });
    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not add teammate");
      return;
    }

    toast.success("Teammate added");
    setName("");
    setEmail("");
    setPassword("");
    setRole(WorkspaceRole.MEMBER);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <Input value={name} onChange={(event) => setName(event.target.value)} disabled={!canManage} placeholder="Aisha Khan" />
        </Field>
        <Field label="Email">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} disabled={!canManage} placeholder="aisha@example.com" />
        </Field>
        <Field label="Temporary password">
          <Input value={password} onChange={(event) => setPassword(event.target.value)} disabled={!canManage} placeholder="At least 8 characters" />
        </Field>
        <Field label="Role">
          <Select value={role} onChange={(event) => setRole(event.target.value as WorkspaceRole)} disabled={!canManage}>
            {Object.values(WorkspaceRole).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Button type="submit" disabled={!canManage || isSubmitting}>
        {isSubmitting ? "Adding..." : "Add teammate"}
      </Button>
    </form>
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
