"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="badge-shimmer inline-block rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-gold dark:border-gold/15 dark:bg-gold/5">
            {eyebrow}
          </p>
        ) : null}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 md:text-base">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </motion.div>
  );
}
