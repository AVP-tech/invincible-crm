import { cn } from "@/lib/utils";

/* ── Base shimmer pulse ── */
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/8",
        className
      )}
    />
  );
}

/* ── Stat card skeleton (4 per row) ── */
export function StatCardSkeleton() {
  return (
    <div className="surface rounded-[2rem] p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-9 w-9 rounded-2xl" />
      </div>
    </div>
  );
}

/* ── Contact card skeleton ── */
export function ContactCardSkeleton() {
  return (
    <div className="surface rounded-[2rem] p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-52" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-14" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3.5 w-28" />
      </div>
    </div>
  );
}

/* ── Task row skeleton ── */
export function TaskRowSkeleton() {
  return (
    <div className="surface rounded-3xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/* ── Deal card skeleton ── */
export function DealCardSkeleton() {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-4 dark:border-white/8 dark:bg-white/5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3.5 w-16" />
      </div>
    </div>
  );
}

/* ── Dashboard full-page skeleton ── */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content cards */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-9 w-24 rounded-2xl" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <TaskRowSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="surface rounded-[2rem] p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <DealCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Contacts page skeleton ── */
export function ContactsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <ContactCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
