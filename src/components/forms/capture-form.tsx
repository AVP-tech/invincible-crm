"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DealStage, TaskPriority, TaskRecurrencePattern } from "@prisma/client";
import { CheckCircle2, Info, Loader2, Mic, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CometBorder } from "@/components/comet-border";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type CapturePreview } from "@/lib/schemas";

type CaptureFormProps = {
  defaultInput?: string;
};

type CaptureResponseMeta = {
  status: "idle" | "ready" | "fallback";
  fallbackReason?: "ai_unavailable";
};

type CaptureApplyResult = {
  contactId?: string | null;
  dealId?: string | null;
  taskId?: string | null;
  noteId?: string | null;
};

type AmbiguousTimeHint = {
  defaultTime: string;
  label: string;
};

function withContactDefaults(contact: CapturePreview["contact"]) {
  return {
    tags: contact?.tags ?? [],
    ...contact
  };
}

function withDealDefaults(deal: CapturePreview["deal"]) {
  return {
    stage: deal?.stage ?? DealStage.NEW_LEAD,
    currency: deal?.currency ?? "INR",
    ...deal
  };
}

function withTaskDefaults(task: CapturePreview["task"]) {
  return {
    priority: task?.priority ?? TaskPriority.MEDIUM,
    status: task?.status ?? "OPEN",
    recurrencePattern: task?.recurrencePattern ?? TaskRecurrencePattern.NONE,
    ...task
  };
}

function formatDateTimeInputValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoDateTime(value: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function buildDefaultTimeLabel(input: string) {
  const normalized = input.toLowerCase();

  if (normalized.includes("morning")) {
    return "8:00 AM";
  }

  if (normalized.includes("afternoon") || normalized.includes("noon")) {
    return "12:00 PM";
  }

  if (normalized.includes("evening") || normalized.includes("tonight")) {
    return "4:00 PM";
  }

  return "9:00 AM";
}

function extractAmbiguousTimeHints(input: string): AmbiguousTimeHint[] {
  const clauses = input
    .split(/[.!?\n]+/)
    .map((clause) => clause.trim())
    .filter(Boolean);
  const dateReferencePattern =
    /\b(?:today|tomorrow|day after tomorrow|in\s+\d+\s+days?|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/;
  const calendarDatePattern =
    /\b(?:\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?)\b/;
  const explicitTimePattern = /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/;
  const fuzzyTimePattern = /\b(?:morning|afternoon|evening|noon|tonight)\b/;
  const seen = new Set<string>();

  return clauses.flatMap((clause) => {
    const normalized = clause.toLowerCase();
    const hasDateReference = dateReferencePattern.test(normalized) || calendarDatePattern.test(normalized);
    const hasExplicitTime = explicitTimePattern.test(normalized);
    const hasFuzzyTime = fuzzyTimePattern.test(normalized);

    if ((!hasFuzzyTime && (!hasDateReference || hasExplicitTime)) || seen.has(clause)) {
      return [];
    }

    seen.add(clause);

    return [
      {
        defaultTime: buildDefaultTimeLabel(clause),
        label: clause
      }
    ];
  });
}

function getValidationIssues(preview: CapturePreview | null) {
  return {
    contactName: preview?.contact && !preview.contact.name?.trim() ? "Add a contact name." : "",
    dealTitle: preview?.deal && !preview.deal.title?.trim() ? "Add a deal title." : "",
    taskTitle: preview?.task && !preview.task.title?.trim() ? "Add a task title." : "",
    taskPriority: preview?.task && !preview.task.priority ? "Choose a task priority." : ""
  };
}

function getBlockedSaveReason(issues: ReturnType<typeof getValidationIssues>) {
  return Object.values(issues).filter(Boolean).join(" ");
}

function getConfidenceMeta(confidence: number) {
  if (confidence >= 0.85) {
    return {
      label: "High confidence",
      tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
    };
  }

  if (confidence >= 0.7) {
    return {
      label: "Good",
      tone: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
    };
  }

  if (confidence >= 0.5) {
    return {
      label: "Review fields",
      tone: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
    };
  }

  return {
    label: "Low - review carefully",
    tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200"
  };
}

function buildSavedSummary(result: CaptureApplyResult) {
  const entities = [
    result.contactId ? "Contact" : null,
    result.dealId ? "Deal" : null,
    result.taskId ? "Task" : null,
    !result.contactId && !result.dealId && !result.taskId && result.noteId ? "Note" : null
  ].filter(Boolean) as string[];

  if (!entities.length) {
    return "Saved to CRM.";
  }

  if (entities.length === 1) {
    return `Saved to CRM - ${entities[0]} created.`;
  }

  if (entities.length === 2) {
    return `Saved to CRM - ${entities[0]} and ${entities[1]} created.`;
  }

  return `Saved to CRM - ${entities.slice(0, -1).join(", ")}, and ${entities.at(-1)} created.`;
}

function hasStructuredFields(preview: CapturePreview) {
  return Boolean(preview.contact || preview.deal || preview.task);
}

export function CaptureForm({ defaultInput = "" }: CaptureFormProps) {
  const router = useRouter();
  const [input, setInput] = useState(defaultInput);
  const [preview, setPreview] = useState<CapturePreview | null>(null);
  const [captureMeta, setCaptureMeta] = useState<CaptureResponseMeta>({ status: "idle" });
  const [isParsing, setIsParsing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [savedSummary, setSavedSummary] = useState<string | null>(null);
  const [showTimeConfirmation, setShowTimeConfirmation] = useState(false);
  const [timeConfirmationAccepted, setTimeConfirmationAccepted] = useState(false);
  const ambiguousTimeHints = extractAmbiguousTimeHints(input);
  const needsTimeConfirmation = Boolean(preview && ambiguousTimeHints.length > 0);
  const taskDateFieldId = "capture-task-due-date";

  const validationIssues = getValidationIssues(preview);
  const blockedSaveReason = getBlockedSaveReason(validationIssues);
  const saveBlocked = Boolean(blockedSaveReason) || isApplying || !preview;
  const confidenceMeta = preview ? getConfidenceMeta(preview.confidence) : null;

  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const toggleListening = async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    // Start recording
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Microphone is not supported on this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => setIsListening(true);
      
      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");
          
          const response = await fetch("/api/capture/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          if (data.text) {
             setTimeConfirmationAccepted(false);
             setInput((prev) => (prev + " " + data.text).trim());
          } else {
             toast.error(data.error || "Failed to transcribe audio.");
          }
        } catch {
          toast.error("Error connecting to transcription service.");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
    } catch {
      toast.error("Microphone access denied.");
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (!savedSummary) {
      return;
    }

    const timeout = window.setTimeout(() => {
      resetCapture();
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [savedSummary]);

  function resetCapture() {
    setSavedSummary(null);
    setPreview(null);
    setCaptureMeta({ status: "idle" });
    setIsApplying(false);
    setShowTimeConfirmation(false);
    setTimeConfirmationAccepted(false);
    setInput("");
  }

  function updatePreview(updater: (current: CapturePreview) => CapturePreview) {
    setPreview((current) => (current ? updater(current) : current));
  }

  function reviewDetectedTimes() {
    setShowTimeConfirmation(false);
    window.requestAnimationFrame(() => {
      document.getElementById(taskDateFieldId)?.focus();
    });
  }

  async function parseCapture() {
    setIsParsing(true);
    setSavedSummary(null);
    setPreview(null);
    setCaptureMeta({ status: "idle" });
    setShowTimeConfirmation(false);
    setTimeConfirmationAccepted(false);

    try {
      const response = await fetch("/api/capture/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input })
      });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Could not parse this capture");
        return;
      }

      setPreview(payload.preview);
      setCaptureMeta({
        status: payload.status ?? "ready",
        fallbackReason: payload.fallbackReason
      });
      toast.success(payload.status === "fallback" ? "Draft ready. Give it a quick review before saving." : "Draft ready");
    } catch {
      toast.error("Could not parse this capture");
    } finally {
      setIsParsing(false);
    }
  }

  async function submitCapture() {
    if (!preview) {
      return;
    }

    setIsApplying(true);
    try {
      const response = await fetch("/api/capture/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, preview })
      });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Could not save the capture");
        return;
      }

      const summary = buildSavedSummary(payload.result ?? {});
      setSavedSummary(summary);
      toast.success(summary);
      router.refresh();
    } catch {
      toast.error("Could not save the capture");
    } finally {
      setIsApplying(false);
    }
  }

  async function applyCapture() {
    if (!preview) {
      return;
    }

    if (needsTimeConfirmation && !timeConfirmationAccepted) {
      setShowTimeConfirmation(true);
      return;
    }

    await submitCapture();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <CometBorder isActive={isParsing || input.length > 0} radius="1rem" duration={2.6}>
        <Card className={isParsing || input.length > 0 ? "border-transparent" : "transition-colors"}>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Quick capture</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Write the update once. We&apos;ll draft the CRM fields.</h2>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <Textarea
              aria-label={"e.g. \"Called Priya, she's interested, send proposal by Friday\""}
              autoComplete="off"
              className="min-h-[240px]"
              placeholder={"e.g. \"Called Priya, she's interested, send proposal by Friday\""}
              value={input}
              onChange={(event) => {
                setTimeConfirmationAccepted(false);
                setShowTimeConfirmation(false);
                setInput(event.target.value);
              }}
            />

            <div className="flex flex-wrap gap-3">
              <Button onClick={parseCapture} disabled={isParsing || input.trim().length < 4}>
                {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate preview
              </Button>

              <Button
                variant={isListening ? "primary" : "secondary"}
                onClick={toggleListening}
                disabled={isTranscribing}
                className={isListening ? "animate-pulse bg-gold/20 text-gold-foreground border border-gold hover:bg-gold/30 shadow-[0_0_15px_rgba(230,193,106,0.3)] transition-all" : ""}
              >
                {isTranscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-gold" /> : isListening ? <Mic className="mr-2 h-4 w-4 animate-pulse" style={{ color: "#E6C16A" }} /> : <Mic className="mr-2 h-4 w-4" />}
                {isTranscribing ? "Transcribing..." : isListening ? "Stop & Save" : "Dictate"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setTimeConfirmationAccepted(false);
                  setShowTimeConfirmation(false);
                  setInput("Called Priya, she's interested, send proposal by Friday");
                }}
              >
                Try sample
              </Button>
            </div>

            <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600 dark:border dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              Just write what happened. We&apos;ll handle the structure.
            </div>
          </CardContent>
        </Card>
      </CometBorder>

      <Card className="border-gold/15 shadow-elevated">
        <CardHeader className="border-b border-black/5 pb-5 dark:border-white/10">
          <div className="w-full">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Confirmation</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-ink">{preview?.summary ?? "Review before saving"}</h2>
              {preview && !savedSummary ? (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  <span className="mr-2 h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-300" />
                  Draft - not saved yet
                </span>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent aria-live="polite" className="space-y-6">
          {savedSummary ? (
            <div className="surface-soft rounded-4xl p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-300" />
              <p className="mt-4 text-lg font-semibold text-ink">{savedSummary}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">The draft is now committed. Start the next update whenever you&apos;re ready.</p>
              <Button className="mt-5" onClick={resetCapture}>
                Capture another
              </Button>
            </div>
          ) : isParsing ? (
            <ConfirmationSkeleton />
          ) : !preview ? (
            <div className="surface-soft rounded-4xl p-6 text-sm text-slate-600 dark:text-slate-300">
              Parse a note to see draft contacts, deals, tasks, and notes here before anything is saved.
            </div>
          ) : (
            <>
              {captureMeta.status === "fallback" && captureMeta.fallbackReason === "ai_unavailable" ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                  Draft generated in safe mode. Give the fields a quick review before saving.
                </div>
              ) : null}

              <div className="rounded-3xl bg-sand/60 p-4 dark:border dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex flex-wrap items-center gap-3">
                  {confidenceMeta ? (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${confidenceMeta.tone}`}>
                      {(preview.confidence * 100).toFixed(0)}% - {confidenceMeta.label}
                    </span>
                  ) : null}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-slate-500 transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 dark:border-white/10 dark:text-slate-300"
                    >
                      <Info className="h-4 w-4" />
                      <span className="sr-only">About the confidence score</span>
                    </button>
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute left-0 top-10 z-10 w-72 rounded-2xl bg-[#132032] px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      Confidence score reflects how certain the draft is about the extracted fields. Below 70% - review all fields carefully before saving.
                    </div>
                  </div>
                </div>

                {preview.missingFields.length ? (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    Missing details: {preview.missingFields.join(", ")}
                  </p>
                ) : null}

                {preview.suggestedUpdates.length ? (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{preview.suggestedUpdates.join(" | ")}</p>
                ) : null}
              </div>

              {needsTimeConfirmation ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                  We found time phrases like morning, evening, or date-only deadlines in this note. Saving will open a quick confirmation popup so the user can review the exact time first.
                </div>
              ) : null}

              {!hasStructuredFields(preview) ? (
                <div className="surface-soft rounded-4xl p-6 text-sm text-slate-600 dark:text-slate-300">
                  We couldn&apos;t extract structured fields from this note. Try adding a name, action, or date - for example: &quot;Call Rahul tomorrow about the proposal.&quot;
                </div>
              ) : null}

              <div className="space-y-0">
                {preview.contact ? (
                  <CaptureSection title="Contact" isFirst>
                    <div className="space-y-3 rounded-3xl border border-black/5 bg-white/95 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/70">
                      <div className="space-y-1">
                        <Input
                          value={preview.contact.name ?? ""}
                          onChange={(event) =>
                            updatePreview((current) => ({
                              ...current,
                              contact: {
                                ...withContactDefaults(current.contact),
                                name: event.target.value
                              }
                            }))
                          }
                          placeholder="Contact name"
                        />
                        {validationIssues.contactName ? <InlineError message={validationIssues.contactName} /> : null}
                      </div>
                      <Input
                        value={preview.contact.companyName ?? ""}
                        onChange={(event) =>
                          updatePreview((current) => ({
                            ...current,
                            contact: {
                              ...withContactDefaults(current.contact),
                              companyName: event.target.value
                            }
                          }))
                        }
                        placeholder="Company"
                      />
                    </div>
                  </CaptureSection>
                ) : null}

                {preview.deal ? (
                  <CaptureSection title="Deal" isFirst={!preview.contact}>
                    <div className="space-y-3 rounded-3xl border border-black/5 bg-white/95 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/70">
                      <div className="space-y-1">
                        <Input
                          value={preview.deal.title ?? ""}
                          onChange={(event) =>
                            updatePreview((current) => ({
                              ...current,
                              deal: {
                                ...withDealDefaults(current.deal),
                                title: event.target.value
                              }
                            }))
                          }
                          placeholder="Deal title"
                        />
                        {validationIssues.dealTitle ? <InlineError message={validationIssues.dealTitle} /> : null}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Deal amount</p>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">₹</span>
                            <Input
                              className="pl-8"
                              type="number"
                              value={preview.deal.amount ?? ""}
                              onChange={(event) =>
                                updatePreview((current) => ({
                                  ...current,
                                  deal: {
                                    ...withDealDefaults(current.deal),
                                    amount: event.target.value ? Number(event.target.value) : null
                                  }
                                }))
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Stage</p>
                          <Select
                            value={preview.deal.stage ?? DealStage.NEW_LEAD}
                            onChange={(event) =>
                              updatePreview((current) => ({
                                ...current,
                                deal: {
                                  ...withDealDefaults(current.deal),
                                  stage: event.target.value as DealStage
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
                      </div>
                    </div>
                  </CaptureSection>
                ) : null}

                {preview.task ? (
                  <CaptureSection title="Task" isFirst={!preview.contact && !preview.deal}>
                    <div className="space-y-3 rounded-3xl border border-black/5 bg-white/95 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/70">
                      <div className="space-y-1">
                        <Input
                          value={preview.task.title ?? ""}
                          onChange={(event) =>
                            updatePreview((current) => ({
                              ...current,
                              task: {
                                ...withTaskDefaults(current.task),
                                title: event.target.value
                              }
                            }))
                          }
                          placeholder="Task title"
                        />
                        {validationIssues.taskTitle ? <InlineError message={validationIssues.taskTitle} /> : null}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Due date & time</p>
                          <Input
                            id={taskDateFieldId}
                            lang="en-IN"
                            type="datetime-local"
                            value={formatDateTimeInputValue(preview.task.dueDate)}
                            onChange={(event) => {
                              setShowTimeConfirmation(false);
                              setTimeConfirmationAccepted(true);
                              updatePreview((current) => ({
                                ...current,
                                task: {
                                  ...withTaskDefaults(current.task),
                                  dueDate: toIsoDateTime(event.target.value)
                                }
                              }));
                            }}
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Morning defaults to 8:00 AM, afternoon to 12:00 PM, evening to 4:00 PM. You can edit the exact time here.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Priority</p>
                          <Select
                            value={preview.task.priority ?? TaskPriority.MEDIUM}
                            onChange={(event) =>
                              updatePreview((current) => ({
                                ...current,
                                task: {
                                  ...withTaskDefaults(current.task),
                                  priority: event.target.value as TaskPriority
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
                          {validationIssues.taskPriority ? <InlineError message={validationIssues.taskPriority} /> : null}
                        </div>
                      </div>
                    </div>
                  </CaptureSection>
                ) : null}

                {preview.note ? (
                  <CaptureSection title="Note" isFirst={!preview.contact && !preview.deal && !preview.task}>
                    <div className="space-y-3 rounded-3xl border border-black/5 bg-white/95 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/70">
                      <Textarea
                        className="min-h-[120px]"
                        value={preview.note}
                        onChange={(event) =>
                          updatePreview((current) => ({
                            ...current,
                            note: event.target.value
                          }))
                        }
                      />
                    </div>
                  </CaptureSection>
                ) : null}
              </div>

              <div className="group relative inline-flex w-full" tabIndex={saveBlocked && blockedSaveReason ? 0 : -1}>
                <Button
                  aria-disabled={saveBlocked}
                  className="w-full"
                  disabled={saveBlocked}
                  onClick={applyCapture}
                >
                  {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save to CRM
                </Button>
                {saveBlocked && blockedSaveReason ? (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-0 mb-2 w-full rounded-2xl bg-[#132032] px-3 py-2 text-xs text-white opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    {blockedSaveReason}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showTimeConfirmation ? (
        <TimeConfirmationDialog
          hints={ambiguousTimeHints}
          isSaving={isApplying}
          onContinue={() => {
            setTimeConfirmationAccepted(true);
            setShowTimeConfirmation(false);
            void submitCapture();
          }}
          onReview={reviewDetectedTimes}
        />
      ) : null}
    </div>
  );
}

function TimeConfirmationDialog({
  hints,
  isSaving,
  onContinue,
  onReview
}: {
  hints: AmbiguousTimeHint[];
  isSaving: boolean;
  onContinue: () => void;
  onReview: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Confirm time</p>
        <h3 className="mt-3 text-2xl font-semibold text-ink">This note uses fuzzy timing.</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          We spotted phrases like morning, evening, or date-only deadlines. The app has suggested times for them, but the user should confirm before this gets saved.
        </p>

        <div className="mt-5 space-y-3">
          {hints.map((hint) => (
            <div
              key={hint.label}
              className="rounded-3xl border border-black/5 bg-sand/60 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200"
            >
              <p className="font-medium text-ink dark:text-white">{hint.label}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Suggested time: {hint.defaultTime}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onReview}>
            Review dates first
          </Button>
          <Button onClick={onContinue} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue with suggested times
          </Button>
        </div>
      </div>
    </div>
  );
}

function CaptureSection({
  children,
  isFirst,
  title
}: {
  children: React.ReactNode;
  isFirst?: boolean;
  title: string;
}) {
  return (
    <section className={isFirst ? "" : "border-t border-black/5 pt-8 dark:border-white/10"}>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{title}</p>
      {children}
    </section>
  );
}

function InlineError({ message }: { message: string }) {
  return <p className="text-xs text-rose-600 dark:text-rose-300">{message}</p>;
}

function ConfirmationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-sand/60 p-4 dark:border dark:border-slate-800 dark:bg-slate-950/60">
        <p className="text-sm text-slate-600 dark:text-slate-300">Extracting fields from your note...</p>
        <div className="mt-4 h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="mt-3 h-3 w-64 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
      </div>

      {["Contact", "Deal", "Task", "Note"].map((section, index) => (
        <section key={section} className={index === 0 ? "" : "border-t border-black/5 pt-8 dark:border-white/10"}>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{section}</p>
          <div className="space-y-3 rounded-3xl border border-black/5 bg-white/95 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/70">
            <div className="h-11 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/8" />
            <div className="h-11 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/8" />
          </div>
        </section>
      ))}
    </div>
  );
}

