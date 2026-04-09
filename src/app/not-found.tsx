import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface max-w-xl rounded-[2rem] p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-moss">Not found</p>
        <h1 className="mt-4 font-serif text-4xl text-ink">That page isn’t in this workspace.</h1>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          The CRM route may have moved, or the record may have been deleted.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
          <Link href="/search">
            <Button variant="secondary">Search workspace</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
