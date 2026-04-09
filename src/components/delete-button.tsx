"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type DeleteButtonProps = {
  endpoint: string;
  redirectTo: string;
  label: string;
};

export function DeleteButton({ endpoint, redirectTo, label }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDelete() {
    if (!window.confirm("Are you sure you want to remove this item?")) {
      return;
    }

    setIsDeleting(true);
    const response = await fetch(endpoint, { method: "DELETE" });
    const payload = await response.json();
    setIsDeleting(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Delete failed");
      return;
    }

    toast.success(`${label} deleted`);
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Button variant="danger" onClick={onDelete} disabled={isDeleting}>
      {isDeleting ? "Deleting..." : `Delete ${label}`}
    </Button>
  );
}
