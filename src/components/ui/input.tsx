import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-moss/70 focus:ring-4 focus:ring-moss/10 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-500",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
