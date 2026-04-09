"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type NoteFormProps = {
  endpoint: string;
  placeholder: string;
};

export function NoteForm({ endpoint, placeholder }: NoteFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content })
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not save note");
      return;
    }

    setContent("");
    toast.success("Note added");
    router.refresh();
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder={placeholder} className="min-h-[110px]" />
      <Button type="submit" disabled={isSubmitting || !content.trim()}>
        {isSubmitting ? "Saving..." : "Add note"}
      </Button>
    </form>
  );
}
