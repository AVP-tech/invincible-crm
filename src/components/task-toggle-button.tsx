"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function TaskToggleButton({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function toggle() {
    setIsLoading(true);
    const response = await fetch(`/api/tasks/${taskId}/toggle`, {
      method: "POST"
    });
    const payload = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not update task");
      return;
    }

    toast.success(
      isCompleted
        ? "Task reopened"
        : payload.spawnedTask
          ? "Task completed. Next recurring follow-up scheduled."
          : "Task completed"
    );
    router.refresh();
  }

  return (
    <Button variant={isCompleted ? "secondary" : "primary"} onClick={toggle} disabled={isLoading}>
      {isLoading ? "Saving..." : isCompleted ? "Mark open" : "Complete"}
    </Button>
  );
}
