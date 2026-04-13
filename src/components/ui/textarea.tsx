import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[140px] w-full rounded-3xl border border-black/10 bg-white/95 px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-moss/70 focus:ring-4 focus:ring-moss/10 dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-400",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
