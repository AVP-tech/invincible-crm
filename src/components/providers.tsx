"use client";

import { Toaster } from "sonner";
import { CommandPalette } from "@/components/command-palette";

export function Providers() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "!rounded-3xl !border !border-black/10 !bg-white !text-ink !shadow-soft dark:!border-white/10 dark:!bg-[rgb(22,28,40)] dark:!text-slate-200",
            title: "!text-sm !font-semibold",
            description: "!text-xs !text-slate-600"
          }
        }}
      />
      <CommandPalette />
    </>
  );
}
