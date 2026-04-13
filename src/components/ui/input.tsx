import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-black/10 bg-white/95 px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-moss/70 focus:ring-4 focus:ring-moss/10 dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-400",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
