"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "btn-shimmer bg-[#132032] text-white shadow-soft hover:bg-[#1d304b] hover:shadow-elevated dark:bg-white dark:text-[#132032] dark:hover:bg-slate-200",
  secondary: "bg-white text-[#132032] border border-black/10 hover:bg-slate-50 hover:border-black/15 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-white/20",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
  danger: "bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <motion.button
      ref={ref}
      type={type}
      suppressHydrationWarning
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
