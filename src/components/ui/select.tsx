import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      suppressHydrationWarning
      className={cn(
        "w-full rounded-2xl border border-black/10 bg-white/95 px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-moss/70 focus:ring-4 focus:ring-moss/10 dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-100 dark:[&_option]:bg-slate-950 dark:[&_option]:text-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";
