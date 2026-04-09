import {
  AutomationActionType,
  AutomationTriggerType,
  ConversationSource,
  DealStage,
  InvoiceStatus,
  TaskPriority,
  TaskRecurrencePattern,
  TaskStatus,
  WorkspaceRole
} from "@prisma/client";
import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional();

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || z.email().safeParse(value).success, "Enter a valid email");

const optionalDateString = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional();

export const authLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password should be at least 8 characters")
});

export const authRegisterSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.email(),
  password: z.string().min(8, "Password should be at least 8 characters")
});

export const contactInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: optionalEmail,
  phone: optionalString,
  companyName: optionalString,
  source: optionalString,
  tagsText: z.string().trim().optional().default("")
});

export const noteInputSchema = z.object({
  content: z.string().trim().min(2, "Note content is required")
});

export const dealInputSchema = z.object({
  title: z.string().trim().min(2, "Deal title is required"),
  description: optionalString,
  contactId: optionalString,
  assignedToUserId: optionalString,
  companyName: optionalString,
  stage: z.nativeEnum(DealStage),
  amount: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value == null || value === "") return undefined;

      const numericValue = typeof value === "number" ? value : Number(value);
      return Number.isFinite(numericValue) ? numericValue : undefined;
    }),
  currency: optionalString,
  expectedCloseDate: optionalDateString,
  nextStep: optionalString
});

export const taskInputSchema = z.object({
  title: z.string().trim().min(2, "Task title is required"),
  description: optionalString,
  contactId: optionalString,
  dealId: optionalString,
  assignedToUserId: optionalString,
  dueDate: optionalDateString,
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.OPEN),
  recurrencePattern: z.nativeEnum(TaskRecurrencePattern).default(TaskRecurrencePattern.NONE),
  recurrenceIntervalDays: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value == null || value === "") return undefined;

      const numericValue = typeof value === "number" ? value : Number(value);
      return Number.isFinite(numericValue) ? Math.trunc(numericValue) : undefined;
    })
}).superRefine((data, ctx) => {
  if (data.recurrencePattern !== TaskRecurrencePattern.NONE && !data.dueDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dueDate"],
      message: "Recurring tasks need a due date so the next follow-up can be scheduled"
    });
  }

  if (data.recurrencePattern === TaskRecurrencePattern.CUSTOM_DAYS) {
    if (!data.recurrenceIntervalDays || data.recurrenceIntervalDays < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recurrenceIntervalDays"],
        message: "Enter a custom repeat interval of at least 2 days"
      });
    }
  }
});

export const profileInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.email(),
  currentPassword: optionalString,
  newPassword: optionalString
});

export const teamMemberInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.email(),
  password: z.string().min(8, "Password should be at least 8 characters"),
  role: z.nativeEnum(WorkspaceRole).default(WorkspaceRole.MEMBER)
});

export const emailIntegrationInputSchema = z.object({
  name: z.string().trim().min(2, "Connection name is required").default("Primary inbox"),
  host: z.string().trim().min(2, "IMAP host is required"),
  port: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, "Enter a valid IMAP port"),
  secure: z.boolean().default(true),
  username: z.string().trim().min(2, "Username is required"),
  password: z.string().trim().min(2, "Password is required"),
  mailbox: z.string().trim().default("INBOX")
});

export const whatsappIntegrationInputSchema = z.object({
  name: z.string().trim().min(2, "Connection name is required").default("Primary WhatsApp"),
  phoneNumberId: z.string().trim().min(2, "Phone number id is required"),
  verifyToken: z.string().trim().min(8, "Verify token is required"),
  accessToken: optionalString
});

export const automationRuleInputSchema = z.object({
  name: z.string().trim().min(2, "Automation name is required"),
  isActive: z.boolean().default(true),
  triggerType: z.nativeEnum(AutomationTriggerType),
  triggerStage: z.nativeEnum(DealStage).optional(),
  actionType: z.nativeEnum(AutomationActionType),
  taskTitle: optionalString,
  taskDescription: optionalString,
  dueInDays: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value == null || value === "") return undefined;

      const numericValue = typeof value === "number" ? value : Number(value);
      return Number.isFinite(numericValue) ? Math.trunc(numericValue) : undefined;
    }),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  noteContent: optionalString
}).superRefine((data, ctx) => {
  if (data.actionType === AutomationActionType.CREATE_TASK && !data.taskTitle) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["taskTitle"],
      message: "Task title is required for task automations"
    });
  }

  if (data.actionType === AutomationActionType.ADD_NOTE && !data.noteContent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["noteContent"],
      message: "Note content is required for note automations"
    });
  }

  if (data.triggerType === AutomationTriggerType.DEAL_STAGE_CHANGED && !data.triggerStage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["triggerStage"],
      message: "Choose the stage that should trigger this automation"
    });
  }
});

export const invoiceInputSchema = z.object({
  number: z.string().trim().min(2, "Invoice number is required"),
  clientName: z.string().trim().min(2, "Client name is required"),
  contactId: optionalString,
  dealId: optionalString,
  amount: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value) && value > 0, "Enter a valid amount"),
  currency: optionalString,
  status: z.nativeEnum(InvoiceStatus).default(InvoiceStatus.DRAFT),
  issueDate: optionalDateString,
  dueDate: optionalDateString,
  notes: optionalString
});

export const captureEntityContactSchema = z.object({
  name: optionalString,
  email: optionalEmail,
  phone: optionalString,
  companyName: optionalString,
  source: optionalString,
  tags: z.array(z.string()).default([])
});

export const captureEntityDealSchema = z.object({
  title: optionalString,
  description: optionalString,
  stage: z.nativeEnum(DealStage).default(DealStage.NEW_LEAD),
  amount: z.number().nullable().optional(),
  currency: z.string().default("INR"),
  expectedCloseDate: optionalString,
  nextStep: optionalString
});

export const captureEntityTaskSchema = z.object({
  title: optionalString,
  description: optionalString,
  dueDate: optionalString,
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.OPEN),
  recurrencePattern: z.nativeEnum(TaskRecurrencePattern).default(TaskRecurrencePattern.NONE),
  recurrenceIntervalDays: z.number().int().positive().optional()
});

export const capturePreviewSchema = z.object({
  actionType: z.enum(["create", "update", "mixed", "note"]),
  parserMode: z.enum(["AI", "FALLBACK"]),
  summary: z.string(),
  confidence: z.number().min(0).max(1),
  missingFields: z.array(z.string()).default([]),
  suggestedUpdates: z.array(z.string()).default([]),
  existingContactId: optionalString,
  existingDealId: optionalString,
  contact: captureEntityContactSchema.optional(),
  deal: captureEntityDealSchema.optional(),
  task: captureEntityTaskSchema.optional(),
  note: optionalString
});

export const captureParseRequestSchema = z.object({
  input: z.string().trim().min(4, "Add a little more detail for quick capture")
});

export const captureApplyRequestSchema = z.object({
  input: z.string().trim().min(1),
  preview: capturePreviewSchema
});

export const transcriptPreviewSchema = z.object({
  summary: z.string().min(8),
  keyTakeaways: z.array(z.string()).default([]),
  actionItems: z.array(z.string()).default([]),
  preview: capturePreviewSchema
});

export const transcriptParseRequestSchema = z.object({
  transcript: z.string().trim().min(20, "Paste more of the transcript so the CRM has enough context")
});

export const transcriptApplyRequestSchema = z.object({
  transcript: z.string().trim().min(1),
  preview: capturePreviewSchema,
  summary: z.string().trim().min(8),
  keyTakeaways: z.array(z.string()).default([]),
  actionItems: z.array(z.string()).default([])
});

export const inboxPreviewSchema = z.object({
  source: z.nativeEnum(ConversationSource),
  subject: optionalString,
  participantLabel: optionalString,
  summary: z.string().min(8),
  actionItems: z.array(z.string()).default([]),
  preview: capturePreviewSchema
});

export const inboxParseRequestSchema = z.object({
  source: z.nativeEnum(ConversationSource).default(ConversationSource.WHATSAPP),
  subject: optionalString,
  participantLabel: optionalString,
  content: z.string().trim().min(12, "Paste more of the email or conversation so the CRM has enough context")
});

export const inboxApplyRequestSchema = z.object({
  source: z.nativeEnum(ConversationSource),
  subject: optionalString,
  participantLabel: optionalString,
  content: z.string().trim().min(1),
  summary: z.string().trim().min(8),
  actionItems: z.array(z.string()).default([]),
  preview: capturePreviewSchema
});

export const csvContactImportRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  action: z.enum(["create", "update", "skip"]),
  reason: z.string(),
  existingContactId: optionalString,
  contact: z.object({
    name: optionalString,
    email: optionalEmail,
    phone: optionalString,
    companyName: optionalString,
    source: optionalString,
    tagsText: z.string().default("")
  })
});

export const csvContactImportPreviewSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(csvContactImportRowSchema),
  summary: z.object({
    totalRows: z.number().int().nonnegative(),
    createCount: z.number().int().nonnegative(),
    updateCount: z.number().int().nonnegative(),
    skipCount: z.number().int().nonnegative()
  })
});

export const csvContactPreviewRequestSchema = z.object({
  csvText: z.string().trim().min(8, "Paste a CSV or upload a file before previewing")
});

export const csvContactApplyRequestSchema = z.object({
  preview: csvContactImportPreviewSchema
});

export type ContactInput = z.infer<typeof contactInputSchema>;
export type DealInput = z.infer<typeof dealInputSchema>;
export type TaskInput = z.infer<typeof taskInputSchema>;
export type CapturePreview = z.infer<typeof capturePreviewSchema>;
export type TranscriptPreview = z.infer<typeof transcriptPreviewSchema>;
export type CsvContactImportPreview = z.infer<typeof csvContactImportPreviewSchema>;
export type InboxPreview = z.infer<typeof inboxPreviewSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberInputSchema>;
export type EmailIntegrationInput = z.infer<typeof emailIntegrationInputSchema>;
export type WhatsappIntegrationInput = z.infer<typeof whatsappIntegrationInputSchema>;
export type AutomationRuleInput = z.infer<typeof automationRuleInputSchema>;
export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
