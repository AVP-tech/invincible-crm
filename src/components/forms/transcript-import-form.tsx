"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DealStage, TaskPriority, TaskRecurrencePattern } from "@prisma/client";
import { type TranscriptPreview } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function TranscriptImportForm() {
  const router = useRouter();
  const [transcript, setTranscript] = useState("");
  const [preview, setPreview] = useState<TranscriptPreview | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  function updatePreview(updater: (current: TranscriptPreview) => TranscriptPreview) {
    setPreview((current) => (current ? updater(current) : current));
  }

  async function parseTranscript() {
    setIsParsing(true);

    const response = await fetch("/api/imports/transcript/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ transcript })
    });

    const payload = await response.json();
    setIsParsing(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not analyze the transcript");
      return;
    }

    setPreview(payload.preview);
    toast.success("Transcript preview ready");
  }

  async function applyTranscript() {
    if (!preview) return;

    setIsApplying(true);
    const response = await fetch("/api/imports/transcript/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transcript,
        summary: preview.summary,
        keyTakeaways: preview.keyTakeaways,
        actionItems: preview.actionItems,
        preview: preview.preview
      })
    });
    const payload = await response.json();
    setIsApplying(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not save transcript import");
      return;
    }

    toast.success("Transcript saved to CRM");
    router.push(payload.redirectTo ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Transcript import</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Paste a meeting and extract CRM updates</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <Textarea
            className="min-h-[320px]"
            placeholder={"Rahul: We need a simple CRM for our sales team...\nYou: We can send a proposal by Friday...\nRahul: Budget is around 50k."}
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={parseTranscript} disabled={isParsing || transcript.trim().length < 20}>
              {isParsing ? "Analyzing..." : "Generate transcript preview"}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setTranscript(
                  "Neha: We want a faster website redesign for ABC Studio.\nYou: We can share a proposal by Friday.\nNeha: Our budget is around 80k and we want to move this month."
                )
              }
            >
              Try sample
            </Button>
          </div>
          <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600">
            Best for discovery calls, proposal reviews, or internal handoff notes that should become clean CRM context and follow-ups.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Review</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Clean summary plus structured actions</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {!preview ? (
            <div className="surface-soft rounded-4xl p-6 text-sm text-slate-600">
              Analyze a transcript to preview the meeting summary, key takeaways, and CRM entities before saving.
            </div>
          ) : (
            <>
              <EditableBlock title="Meeting summary">
                <Textarea
                  className="min-h-[120px]"
                  value={preview.summary}
                  onChange={(event) => updatePreview((current) => ({ ...current, summary: event.target.value }))}
                />
              </EditableBlock>

              <ListBlock
                title="Key takeaways"
                values={preview.keyTakeaways}
                onChange={(values) => updatePreview((current) => ({ ...current, keyTakeaways: values }))}
              />

              <ListBlock
                title="Action items"
                values={preview.actionItems}
                onChange={(values) => updatePreview((current) => ({ ...current, actionItems: values }))}
              />

              <EditableBlock title="Contact">
                <Input
                  value={preview.preview.contact?.name ?? ""}
                  onChange={(event) =>
                    updatePreview((current) => ({
                      ...current,
                      preview: {
                        ...current.preview,
                        contact: {
                          ...current.preview.contact,
                          name: event.target.value,
                          tags: current.preview.contact?.tags ?? []
                        }
                      }
                    }))
                  }
                  placeholder="Contact name"
                />
                <Input
                  value={preview.preview.contact?.companyName ?? ""}
                  onChange={(event) =>
                    updatePreview((current) => ({
                      ...current,
                      preview: {
                        ...current.preview,
                        contact: {
                          ...current.preview.contact,
                          companyName: event.target.value,
                          tags: current.preview.contact?.tags ?? []
                        }
                      }
                    }))
                  }
                  placeholder="Company name"
                />
              </EditableBlock>

              <EditableBlock title="Deal">
                <Input
                  value={preview.preview.deal?.title ?? ""}
                  onChange={(event) =>
                    updatePreview((current) => ({
                      ...current,
                      preview: {
                        ...current.preview,
                        deal: {
                          stage: current.preview.deal?.stage ?? DealStage.NEW_LEAD,
                          currency: current.preview.deal?.currency ?? "INR",
                          ...current.preview.deal,
                          title: event.target.value
                        }
                      }
                    }))
                  }
                  placeholder="Deal title"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="number"
                    value={preview.preview.deal?.amount ?? ""}
                    onChange={(event) =>
                      updatePreview((current) => ({
                        ...current,
                        preview: {
                          ...current.preview,
                          deal: {
                            stage: current.preview.deal?.stage ?? DealStage.NEW_LEAD,
                            currency: current.preview.deal?.currency ?? "INR",
                            ...current.preview.deal,
                            amount: event.target.value ? Number(event.target.value) : null
                          }
                        }
                      }))
                    }
                    placeholder="Amount"
                  />
                  <Select
                    value={preview.preview.deal?.stage ?? DealStage.NEW_LEAD}
                    onChange={(event) =>
                      updatePreview((current) => ({
                        ...current,
                        preview: {
                          ...current.preview,
                          deal: {
                            ...current.preview.deal,
                            stage: event.target.value as DealStage,
                            currency: current.preview.deal?.currency ?? "INR"
                          }
                        }
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

              <EditableBlock title="Follow-up task">
                <Input
                  value={preview.preview.task?.title ?? ""}
                  onChange={(event) =>
                    updatePreview((current) => ({
                      ...current,
                      preview: {
                        ...current.preview,
                        task: {
                          priority: current.preview.task?.priority ?? TaskPriority.MEDIUM,
                          status: current.preview.task?.status ?? "OPEN",
                          recurrencePattern: current.preview.task?.recurrencePattern ?? TaskRecurrencePattern.NONE,
                          ...current.preview.task,
                          title: event.target.value
                        }
                      }
                    }))
                  }
                  placeholder="Task title"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={preview.preview.task?.dueDate ? preview.preview.task.dueDate.slice(0, 10) : ""}
                    onChange={(event) =>
                      updatePreview((current) => ({
                        ...current,
                        preview: {
                          ...current.preview,
                          task: {
                            priority: current.preview.task?.priority ?? TaskPriority.MEDIUM,
                            status: current.preview.task?.status ?? "OPEN",
                            recurrencePattern: current.preview.task?.recurrencePattern ?? TaskRecurrencePattern.NONE,
                            ...current.preview.task,
                            dueDate: event.target.value ? new Date(`${event.target.value}T09:00:00`).toISOString() : undefined
                          }
                        }
                      }))
                    }
                  />
                  <Select
                    value={preview.preview.task?.priority ?? TaskPriority.MEDIUM}
                    onChange={(event) =>
                      updatePreview((current) => ({
                        ...current,
                        preview: {
                          ...current.preview,
                          task: {
                            ...current.preview.task,
                            priority: event.target.value as TaskPriority,
                            status: current.preview.task?.status ?? "OPEN",
                            recurrencePattern: current.preview.task?.recurrencePattern ?? TaskRecurrencePattern.NONE
                          }
                        }
                      }))
                    }
                  >
                    {Object.values(TaskPriority).map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </Select>
                </div>
              </EditableBlock>

              <EditableBlock title="CRM note">
                <Textarea
                  className="min-h-[160px]"
                  value={preview.preview.note ?? ""}
                  onChange={(event) =>
                    updatePreview((current) => ({
                      ...current,
                      preview: {
                        ...current.preview,
                        note: event.target.value
                      }
                    }))
                  }
                />
              </EditableBlock>

              <Button onClick={applyTranscript} disabled={isApplying}>
                {isApplying ? "Saving..." : "Save transcript import"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EditableBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-3xl border border-black/5 bg-white p-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ListBlock({
  title,
  values,
  onChange
}: {
  title: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <EditableBlock title={title}>
      <Textarea
        className="min-h-[120px]"
        value={values.join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          )
        }
      />
    </EditableBlock>
  );
}
