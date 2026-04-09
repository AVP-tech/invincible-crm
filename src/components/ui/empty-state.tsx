import Link from "next/link";
import { Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="surface-soft rounded-4xl border-dashed border-black/10 dark:border-white/10 p-12 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-moss/10 text-moss mb-6 shadow-inner dark:bg-moss/20">
        <Activity className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
      
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {actionHref && actionLabel && (
          <Link href={actionHref}>
            <Button>{actionLabel}</Button>
          </Link>
        )}
        <Link href="/capture">
          <Button variant="secondary" className="gap-2">
            <Zap className="h-4 w-4 text-moss" />
            Use AI Capture
          </Button>
        </Link>
      </div>
    </div>
  );
}
