"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JobStatusBadge } from "@/components/status-badges";
import { formatDateTime, titleCase } from "@/lib/utils";

type IntegrationJob = {
  id: string;
  type: string;
  status: string;
  attempts: number;
  lastError?: string | null;
  scheduledFor?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  integrationConnectionName?: string | null;
};

type IntegrationJobsPanelProps = {
  canManage: boolean;
  jobs: IntegrationJob[];
};

export function IntegrationJobsPanel({ canManage, jobs }: IntegrationJobsPanelProps) {
  const router = useRouter();
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const queuedCount = jobs.filter((job) => job.status === "QUEUED").length;
  const failedCount = jobs.filter((job) => job.status === "FAILED").length;

  async function processQueuedJobs() {
    setIsProcessingAll(true);

    try {
      const response = await fetch("/api/jobs/process", { method: "POST" });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Could not process jobs");
        return;
      }

      toast.success(payload.processed ? `Processed ${payload.processed} queued job(s)` : "No queued jobs to process");
      router.refresh();
    } finally {
      setIsProcessingAll(false);
    }
  }

  async function runJob(jobId: string) {
    setActiveJobId(jobId);

    try {
      const response = await fetch(`/api/jobs/${jobId}/run`, { method: "POST" });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Could not run job");
        return;
      }

      toast.success("Job completed");
      router.refresh();
    } finally {
      setActiveJobId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="items-center">
        <div>
          <p className="text-sm font-semibold text-ink">Recent jobs</p>
          <p className="mt-1 text-sm text-slate-500">
            {queuedCount || failedCount
              ? `${queuedCount} queued, ${failedCount} failed`
              : "Background processing keeps syncs and webhook work from blocking the UI."}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={processQueuedJobs}
          disabled={!canManage || isProcessingAll}
          className="shrink-0"
        >
          {isProcessingAll ? "Processing..." : "Process queued jobs"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.length ? (
          jobs.map((job) => {
            const isActionable = job.status === "FAILED" || job.status === "QUEUED";

            return (
              <div key={job.id} className="rounded-3xl border border-black/5 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{titleCase(job.type)}</p>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <p className="text-sm text-slate-500">{job.integrationConnectionName ?? "Workspace job"}</p>
                  </div>
                  {isActionable ? (
                    <Button
                      variant="secondary"
                      onClick={() => runJob(job.id)}
                      disabled={!canManage || activeJobId === job.id}
                      className="px-3 py-2 text-xs"
                    >
                      {activeJobId === job.id ? "Running..." : job.status === "FAILED" ? "Retry" : "Run now"}
                    </Button>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span>Attempts: {job.attempts}</span>
                  <span>Queued: {formatDateTime(job.scheduledFor)}</span>
                  {job.finishedAt ? <span>Finished: {formatDateTime(job.finishedAt)}</span> : null}
                  {!job.finishedAt && job.startedAt ? <span>Started: {formatDateTime(job.startedAt)}</span> : null}
                </div>
                {job.lastError ? <p className="mt-3 text-sm text-rose-600">{job.lastError}</p> : null}
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600">No background jobs have run yet.</div>
        )}
      </CardContent>
    </Card>
  );
}
