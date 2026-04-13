"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DealStage, TaskPriority, TaskRecurrencePattern } from "@prisma/client";
import { type CapturePreview } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type AnimationPlaybackControls,
} from "framer-motion";

// ─── Gold theme colour (matches your design token) ───────────────────────────
const GOLD = "rgba(230,193,106";   // base colour – append opacity + ")"

// ─────────────────────────────────────────────────────────────────────────────
// CometBorder
// Wraps any block-level content.  When `isActive` is true a bright-headed
// comet races endlessly around the rectangular edge.  The inner slot keeps
// whatever background / blur the child already has – the gradient lives
// outside it in a 1.5 px inset ring.
// ─────────────────────────────────────────────────────────────────────────────
interface CometBorderProps {
  isActive: boolean;
  /** Must match the border-radius of the direct child (Card usually has rounded-2xl → "1rem") */
  radius?: string;
  /** Orbit duration in seconds */
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

function CometBorder({
  isActive,
  radius = "1rem",
  duration = 2.6,
  children,
  className,
}: CometBorderProps) {
  // angle drives the `from` position of the conic-gradient (0 → 360)
  const angle = useMotionValue(0);

  useEffect(() => {
    let controls: AnimationPlaybackControls | null = null;

    if (isActive) {
      // Kick off from wherever the comet currently sits (no jarring jump)
      controls = animate(angle, angle.get() + 360, {
        duration,
        repeat: Infinity,
        ease: "linear",
      });
    }

    return () => controls?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Comet: bright gold head → fading tail over ≈ 70 ° → transparent for the rest
  const conicBg = useTransform(angle, (a) =>
    [
      `conic-gradient(from ${a}deg at 50% 50%,`,
      `  ${GOLD},1.00) 0deg,`,      // ← head (brightest)
      `  ${GOLD},0.80) 5deg,`,
      `  ${GOLD},0.50) 15deg,`,
      `  ${GOLD},0.20) 35deg,`,
      `  ${GOLD},0.05) 55deg,`,
      `  transparent   70deg,`,       // tail fully gone
      `  transparent   360deg`,       // rest of the border: dark / invisible
      `)`,
    ].join("\n")
  );

  // Second pass: ambient glow that breathes very gently when active
  const glowOpacity = useMotionValue(0);

  useEffect(() => {
    const target = isActive ? 1 : 0;
    const c = animate(glowOpacity, target, { duration: 0.6, ease: "easeInOut" });
    return c.stop;
  }, [isActive, glowOpacity]);

  // Keep the inner radius slightly smaller so the 1.5 px strip is visible
  const innerRadius = `calc(${radius} - 1.5px)`;

  return (
    <div
      className={className}
      style={{ position: "relative", borderRadius: radius }}
    >
      {/* ── Layer 1: conic-gradient "comet" border ── */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background: conicBg,
          // We only fade the whole layer in / out; the gradient itself animates
          // continuously so there's no hitch when `isActive` turns on mid-orbit.
        }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* ── Layer 2: soft ambient glow behind the card ── */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          // Glow is a subtle gold halo – strong enough to see on dark glass
          boxShadow: [
            `0 0  8px 1px  ${GOLD},0.30)`,
            `0 0 24px 4px  ${GOLD},0.15)`,
            `0 0 48px 8px  ${GOLD},0.07)`,
          ].join(", "),
          opacity: glowOpacity,
        }}
      />

      {/* ── Layer 3: actual content ──────────────────────────────────────────
          1.5 px margin exposes the gradient ring at the edges.
          We don't clip the child here so the Card's own rounded corners look
          natural and the backdrop-blur (if any) extends to the very edge.     */}
      <div
        style={{
          position: "relative",
          margin: "1.5px",
          borderRadius: innerRadius,
          // Guarantees the inner background colour does not leak under the ring
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

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

  function updatePreview(updater: (current: CapturePreview) => CapturePreview) {
    setPreview((current) => (current ? updater(current) : current));
  }

  async function parseCapture() {
    setIsParsing(true);
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
    toast.success("Preview ready");
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
      <CometBorder isActive={isParsing} radius="1rem" duration={2.6}>
        <Card
          /*
            Make sure the Card itself has NO opaque ring of its own that would
            sit on top of the comet ring.  If your Card already has a border,
            add  border-transparent  or  border-0  here while isParsing is true.
            Example:
              className={isParsing ? "border-transparent" : undefined}
          */
        >
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

            <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-400">
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
            <div className="surface-soft rounded-4xl p-6 text-sm text-slate-600">
              Parse a capture to see contact, deal, task, and note suggestions
              here.
            </div>
          ) : (
            <>
              <div className="rounded-3xl bg-sand/60 p-4">
                <p className="font-semibold text-ink">{preview.summary}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Confidence {(preview.confidence * 100).toFixed(0)}% via{" "}
                  {preview.parserMode}
                </p>
                {preview.suggestedUpdates.length ? (
                  <p className="mt-2 text-xs text-slate-500">
                    {preview.suggestedUpdates.join(" | ")}
                  </p>
                ) : null}
              </div>

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
                    onChange={(event) =>
                      updatePreview((current) => ({
                        ...current,
                        task: {
                          ...current.task,
                          priority: event.target.value as TaskPriority,
                          status: current.task?.status ?? "OPEN",
                          recurrencePattern:
                            current.task?.recurrencePattern ??
                            TaskRecurrencePattern.NONE,
                        },
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
                disabled={isApplying || saved}
                className={saved ? "bg-moss! text-white!" : ""}
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Saved!
                  </>
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
    <div className="space-y-3 rounded-3xl border border-black/5 bg-white p-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
