"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { authLoginSchema, authRegisterSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthFormProps = {
  mode: "login" | "register";
};

type AuthField = {
  name: "name" | "email" | "password";
  label: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const schema = mode === "login" ? authLoginSchema : authRegisterSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "login"
        ? { email: "", password: "" }
        : { name: "", email: "", password: "" }
  });

  const fields: AuthField[] =
    mode === "register"
      ? [
          { name: "name", label: "Full name", placeholder: "Riya Kapoor" },
          { name: "email", label: "Email address", placeholder: "you@business.com", type: "email" },
          { name: "password", label: "Password", placeholder: "Minimum 8 characters", type: "password" }
        ]
      : [
          { name: "email", label: "Email address", placeholder: "you@business.com", type: "email" },
          { name: "password", label: "Password", placeholder: "Minimum 8 characters", type: "password" }
        ];

  async function onSubmit(values: Record<string, string>) {
    setIsSubmitting(true);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to continue");
      return;
    }

    toast.success(mode === "login" ? "Welcome back" : "Account created");
    router.push(payload.redirectTo ?? "/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.name} className="cinematic-auth-field space-y-2 relative" style={{ animationDelay: `${index * 90}ms` }}>
          <label className="text-sm font-medium text-slate-700">{field.label}</label>
          <div className="relative">
            <Input
              placeholder={field.placeholder}
              type={field.name === "password" && showPassword ? "text" : field.type}
              autoComplete={
                field.name === "email" ? "email" :
                field.name === "password" ? (mode === "login" ? "current-password" : "new-password") :
                field.name === "name" ? "name" : "off"
              }
              className={field.name === "password" ? "pr-10" : ""}
              {...form.register(field.name)}
            />
            {field.name === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
          <p className="text-xs text-rose-600">{String(form.formState.errors[field.name]?.message ?? "")}</p>
        </div>
      ))}

      <div className="cinematic-auth-field pt-2" style={{ animationDelay: `${fields.length * 90}ms` }}>
        <Button type="submit" className="w-full rounded-2xl py-3" disabled={isSubmitting}>
          {isSubmitting ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </div>
    </form>
  );
}
