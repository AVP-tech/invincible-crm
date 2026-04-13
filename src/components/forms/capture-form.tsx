"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DealStage, TaskPriority, TaskRecurrencePattern } from "@prisma/client";
import { type CapturePreview } from "@/lib/schemas";
import { TaskPriorityBadge } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { CometBorder } from "@/components/comet-border";

// ─────────────────────────────────────────────────────────────────────────────
// CaptureForm
// ─────────────────────────────────────────────────────────────────────────────
type CaptureFormProps = {
  defaultInput?: string;
};

export function CaptureForm({ defaultInput = "" }: CaptureFormProps) {
  const router = useRouter();
  const [input, setInput] = useState(defaultInput);
  const [preview, setPreview] = useState<CapturePreview | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [priorityConfirmed, setPriorityConfirmed] = useState(true);

  function updatePreview(updater: (current: CapturePreview) => CapturePreview) {
    setPreview((current) => (current ? updater(current) : current));
  }

  function confirmPriority(priority: TaskPriority) {
    updatePreview((current) => ({
      ...current,
      task: current.task
        ? {
            ...current.task,
            priority
          }
        : current.task
    }));
    setPriorityConfirmed(true);
  }

  async function parseCapture() {
    setIsParsing(true);
    setSaved(false);
    const response = await fetch("/api/capture/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
    const payload = await response.json();
    setIsParsing(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not parse this capture");
      return;
    }

    setPreview(payload.preview);
    setPriorityConfirmed(!payload.preview.task);
    toast.success(
      payload.preview.parserMode === "AI"
        ? "Preview ready via AI"
        : "Preview ready via fallback parser"
    );
  }

  async function applyCapture() {
    if (!preview) return;

    setIsApplying(true);
    const response = await fetch("/api/capture/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, preview }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setIsApplying(false);
      toast.error(payload.error ?? "Could not save the capture");
      return;
    }

    setSaved(true);
    toast.success("Capture saved to CRM ✓");
    setTimeout(() => {
      router.push(payload.redirectTo ?? "/dashboard");
      router.refresh();
    }, 600);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

      {/* ── Left card: wrapped in CometBorder ───────────────────────────── */}
      {/*
        NOTE ON RADIUS:
        Tailwind's `rounded-xl`  = 0.75 rem
        Tailwind's `rounded-2xl` = 1 rem    ← most shadcn/ui Card defaults
        Tailwind's `rounded-3xl` = 1.5 rem
        Adjust `radius` to match whatever your <Card> actually uses.
      */}
      <CometBorder isActive={isParsing || input.length > 0} radius="1rem" duration={2.6}>
        <Card className={isParsing || input.length > 0 ? "border-transparent" : "transition-colors"}>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">
                Quick capture
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                Turn a sentence into CRM structure
              </h2>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <Textarea
              className="min-h-[240px]"
              placeholder="Met Neha today from ABC Studio, interested in website redesign, budget 80k, send proposal Friday"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={parseCapture}
                disabled={isParsing || input.trim().length < 4}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate preview
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  setInput("Call Rahul tomorrow about the proposal")
                }
              >
                Try sample
              </Button>
            </div>

            <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600 dark:border dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              Use plain language: &quot;Follow up with Priya Monday&quot;,
              &quot;Sent quote to Aman&quot;, or &quot;Met Neha, 80k budget,
              proposal Friday&quot;.
            </div>
          </CardContent>
        </Card>
      </CometBorder>

      {/* ── Right card: confirmation / preview (no comet needed) ─────────── */}
      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">
              Confirmation
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              Review before we write to the CRM
            </h2>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {!preview ? (
            <div className="surface-soft rounded-4xl p-6 text-sm text-slate-600 dark:text-slate-300">
              Parse a capture to see contact, deal, task, and note suggestions
              here.
            </div>
          ) : (
            <>
              <div className="rounded-3xl bg-sand/60 p-4 dark:border dark:border-slate-800 dark:bg-slate-950/60">
                <p className="font-semibold text-ink">{preview.summary}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Confidence {(preview.confidence * 100).toFixed(0)}% via{" "}
                  {preview.parserMode}
                </p>
                {preview.suggestedUpdates.length ? (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {preview.suggestedUpdates.join(" | ")}
                  </p>
                ) : null}
              </div>

              {preview.task ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Confirm task priority before saving
                      </p>
                      <p className="mt-1 text-xs text-amber-800 dark:text-amber-200/80">
                        We extracted a task from your plain text. Choose how urgent it should be.
                      </p>
                    </div>
                    <TaskPriorityBadge priority={preview.task.priority} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.values(TaskPriority).map((priority) => (
                      <Button
                        key={priority}
                        variant={preview.task?.priority === priority ? "primary" : "secondary"}
                        className="px-3 py-2 text-xs"
                        onClick={() => confirmPriority(priority)}
                      >
                        {priority}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              <EditableBlock title="Contact">
                <Input
                  value={preview.contact?.name ?? ""}
                  onChange={(event) =>
                    updatePreview((current) => ({
                      ...current,
                      contact: {
                        ...current.contact,
                        name: event.target.value,
                        tags: current.contact?.tags ?? [],
                      },
                    }))
                  }
                  placeholder="Contact name"
                />
                <Input
                  value={preview.contact?.companyName ?? ""}
                  onChange={(event) =>
                    updatePreview((current) => ({
                      ...current,
                      contact: {
                        ...current.contact,
                        companyName: event.target.value,
                        tags: current.contact?.tags ?? [],
                      },
                    }))
                  }
                  placeholder="Company"
                />
              </EditableBlock>

              <EditableBlock title="Deal">
                <Input
                  value={preview.deal?.title ?? ""}
                  onChange={(event) =>
                    updatePreview((current) => ({
                      ...current,
                      deal: {
                        stage: current.deal?.stage ?? DealStage.NEW_LEAD,
                        currency: current.deal?.currency ?? "INR",
                        ...current.deal,
                        title: event.target.value,
                      },
                    }))
                  }
                  placeholder="Deal title"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="number"
                    value={preview.deal?.amount ?? ""}
                    onChange={(event) =>
                      updatePreview((current) => ({
                        ...current,
                        deal: {
                          stage: current.deal?.stage ?? DealStage.NEW_LEAD,
                          currency: current.deal?.currency ?? "INR",
                          ...current.deal,
                          amount: event.target.value
                            ? Number(event.target.value)
                            : null,
                        },
                      }))
                    }
                    placeholder="Amount"
                  />
                  <Select
                    value={preview.deal?.stage ?? DealStage.NEW_LEAD}
                    onChange={(event) =>
                      updatePreview((current) => ({
                        ...current,
                        deal: {
                          ...current.deal,
                          stage: event.target.value as DealStage,
                          currency: current.deal?.currency ?? "INR",
                        },
                      }))
                    }
                  >
                    {Object.values(DealStage).map((stage) => (
                      <option key={stage} value={stage}>
                        {stage.replaceAll("_", " ")}
                      </option>
                    ))}
                  </Select>
                </div>
              </EditableBlock>

              <EditableBlock title="Task">
                <Input
                  value={preview.task?.title ?? ""}
                  onChange={(event) =>
                    updatePreview((current) => ({
                      ...current,
                      task: {
                        priority: current.task?.priority ?? TaskPriority.MEDIUM,
                        status: current.task?.status ?? "OPEN",
                        recurrencePattern:
                          current.task?.recurrencePattern ??
                          TaskRecurrencePattern.NONE,
                        ...current.task,
                        title: event.target.value,
                      },
                    }))
                  }
                  placeholder="Task title"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={
                      preview.task?.dueDate
                        ? preview.task.dueDate.slice(0, 10)
                        : ""
                    }
                    onChange={(event) =>
                      updatePreview((current) => ({
                        ...current,
                        task: {
                          priority:
                            current.task?.priority ?? TaskPriority.MEDIUM,
                          status: current.task?.status ?? "OPEN",
                          recurrencePattern:
                            current.task?.recurrencePattern ??
                            TaskRecurrencePattern.NONE,
                          ...current.task,
                          dueDate: event.target.value
                            ? new Date(
                                `${event.target.value}T09:00:00`
                              ).toISOString()
                            : undefined,
                        },
                      }))
                    }
                  />
                  <Select
                    value={preview.task?.priority ?? TaskPriority.MEDIUM}
                    onChange={(event) => confirmPriority(event.target.value as TaskPriority)}
                  >
                    {Object.values(TaskPriority).map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </Select>
                </div>
              </EditableBlock>

              <EditableBlock title="Note">
                <Textarea
                  className="min-h-[120px]"
                  value={preview.note ?? ""}
                  onChange={(event) =>
                    updatePreview((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                />
              </EditableBlock>

              <Button
                onClick={applyCapture}
                disabled={isApplying || saved || Boolean(preview.task && !priorityConfirmed)}
                className={saved ? "bg-moss! text-white!" : ""}
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Saved!
                  </>
                ) : preview.task && !priorityConfirmed ? (
                  "Confirm priority to save"
                ) : isApplying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save to CRM"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EditableBlock – unchanged helper
// ─────────────────────────────────────────────────────────────────────────────
function EditableBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-3xl border border-black/5 bg-white/95 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/70">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
