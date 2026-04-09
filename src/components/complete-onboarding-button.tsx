"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CompleteOnboardingButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function complete() {
    setIsLoading(true);
    const response = await fetch("/api/onboarding/complete", {
      method: "POST"
    });
    const payload = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not start the workspace");
      return;
    }

    toast.success("Workspace ready");
    router.push("/dashboard");
    router.refresh();
  }

  return <Button onClick={complete}>{isLoading ? "Preparing..." : "Enter workspace"}</Button>;
}
