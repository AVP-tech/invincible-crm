"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConversationSource, DealStage, TaskPriority, TaskRecurrencePattern } from "@prisma/client";
import { type InboxPreview } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const sampleContent: Record<ConversationSource, { subject: string; participantLabel: string; content: string }> = {
  WHATSAPP: {
    subject: "Website redesign follow-up",
    participantLabel: "Neha Sharma • ABC Studio",
    content:
      "Neha: Hey, the proposal looks good overall.\nNeha: Can you also include the landing page rewrite and confirm if Friday still works for kickoff?\nYou: Yes, I can send the updated version tomorrow.\nNeha: Great. Budget is still around 80k and we want to move this month."
  },
  EMAIL: {
    subject: "CRM rollout proposal",
    participantLabel: "Rahul Verma • Northline Fitness",
    content:
      "Rahul,\n\nThanks for the walkthrough today. We need a simpler CRM for our 5-person sales team and we want to start next week if possible.\n\nPlease send the final proposal by Friday. Budget is around 50k.\n\nBest,\nRahul"
  },
  MANUAL: {
    subject: "Call recap",
    participantLabel: "Priya Menon",
    content:
      "Priya wants a faster outbound process audit. She is comparing two options, needs a revised scope this week, and asked for a concrete implementation plan before making a decision."
  }
};

export function InboxCaptureForm() {
  const router = useRouter();
  const [source, setSource] = useState<ConversationSource>(ConversationSource.WHATSAPP);
  const [subject, setSubject] = useState("");
  const [participantLabel, setParticipantLabel] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<InboxPreview | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  function updatePreview(updater: (current: InboxPreview) => InboxPreview) {
    setPreview((current) => (current ? updater(current) : current));
  }

  async function parseInbox() {
    setIsParsing(true);

    const response = await fetch("/api/inbox/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ source, subject, participantLabel, content })
    });

    const payload = await response.json();
    setIsParsing(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not analyze this conversation");
      return;
    }

    setPreview(payload.preview);
    toast.success("Inbox preview ready");
  }

  async function applyInbox() {
    if (!preview) return;

    setIsApplying(true);
    const response = await fetch("/api/inbox/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source: preview.source,
        subject: preview.subject,
        participantLabel: preview.participantLabel,
        content,
        summary: preview.summary,
        actionItems: preview.actionItems,
        preview: preview.preview
      })
    });

    const payload = await response.json();
    setIsApplying(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not save inbox capture");
      return;
    }

    toast.success("Conversation saved to CRM");
    router.push(payload.redirectTo ?? "/inbox");
    router.refresh();
  }

  function applySample() {
    const sample = sampleContent[source];
    setSubject(sample.subject);
    setParticipantLabel(sample.participantLabel);
    setContent(sample.content);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Inbox capture</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Turn WhatsApp and email context into CRM actions</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Source">
              <Select value={source} onChange={(event) => setSource(event.target.value as ConversationSource)}>
                <option value={ConversationSource.WHATSAPP}>WhatsApp</option>
                <option value={ConversationSource.EMAIL}>Email</option>
                <option value={ConversationSource.MANUAL}>Manual note</option>
              </Select>
            </Field>
            <Field label="People / thread label">
              <Input placeholder="Rahul Verma • Northline Fitness" value={participantLabel} onChange={(event) => setParticipantLabel(event.target.value)} />
            </Field>
          </div>

          <Field label={source === ConversationSource.EMAIL ? "Subject" : "Conversation label"}>
            <Input
              placeholder={source === ConversationSource.EMAIL ? "CRM rollout proposal" : "Proposal follow-up"}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </Field>

          <Field label="Conversation">
            <Textarea
              className="min-h-[320px]"
              placeholder={
                source === ConversationSource.EMAIL
                  ? "Paste the email body or thread..."
                  : "Paste the WhatsApp conversation, voice note summary, or hand-written chat recap..."
              }
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <Button onClick={parseInbox} disabled={isParsing || content.trim().length < 12}>
              {isParsing ? "Analyzing..." : "Generate inbox preview"}
            </Button>
            <Button variant="secondary" onClick={applySample}>
              Try sample
            </Button>
          </div>

          <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600">
            Best for the messy context that usually lives outside CRMs: chat threads, email replies, founder call notes, and client follow-up messages.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Review</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Confirm the summary, actions, and CRM updates</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {!preview ? (
            <div className="surface-soft rounded-4xl p-6 text-sm text-slate-600">
              Analyze a conversation to preview the summary, action items, and CRM entities before anything is saved.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Source">
                  <Select
                    value={preview.source}
                    onChange={(event) =>
                      updatePreview((current) => ({
                        ...current,
                        source: event.target.value as ConversationSource
                      }))
                    }
                  >
                    <option value={ConversationSource.WHATSAPP}>WhatsApp</option>
                    <option value={ConversationSource.EMAIL}>Email</option>
                    <option value={ConversationSource.MANUAL}>Manual note</option>
                  </Select>
                </Field>
                <Field label="People / thread label">
                  <Input
                    value={preview.participantLabel ?? ""}
                    onChange={(event) => updatePreview((current) => ({ ...current, participantLabel: event.target.value }))}
                  />
                </Field>
              </div>

              <Field label="Subject / label">
                <Input value={preview.subject ?? ""} onChange={(event) => updatePreview((current) => ({ ...current, subject: event.target.value }))} />
              </Field>

              <EditableBlock title="Conversation summary">
                <Textarea
                  className="min-h-[120px]"
                  value={preview.summary}
                  onChange={(event) => updatePreview((current) => ({ ...current, summary: event.target.value }))}
                />
              </EditableBlock>

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
                  className="min-h-[180px]"
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

              <Button onClick={applyInbox} disabled={isApplying}>
                {isApplying ? "Saving..." : "Save conversation to CRM"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
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
