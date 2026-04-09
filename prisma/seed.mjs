import {
  AutomationActionType,
  AutomationTriggerType,
  ConversationSource,
  DealStage,
  IntegrationProvider,
  IntegrationStatus,
  InvoiceStatus,
  JobStatus,
  JobType,
  PrismaClient,
  TaskPriority,
  TaskRecurrencePattern,
  TaskStatus,
  WorkspaceRole
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";

process.loadEnvFile?.(".env");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEMO_USER_EMAIL ?? "demo@invisiblecrm.local";
  const password = process.env.DEMO_USER_PASSWORD ?? "demo12345";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Demo Founder",
      passwordHash
    },
    create: {
      email,
      name: "Demo Founder",
      passwordHash,
      onboardingCompleted: false
    }
  });

  await prisma.activity.deleteMany({ where: { userId: user.id } });
  await prisma.backgroundJob.deleteMany();
  await prisma.automationRule.deleteMany();
  await prisma.integrationConnection.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.conversationLog.deleteMany({ where: { userId: user.id } });
  await prisma.note.deleteMany({ where: { userId: user.id } });
  await prisma.task.deleteMany({ where: { userId: user.id } });
  await prisma.deal.deleteMany({ where: { userId: user.id } });
  await prisma.contact.deleteMany({ where: { userId: user.id } });
  await prisma.company.deleteMany({ where: { userId: user.id } });
  await prisma.parsedCapture.deleteMany({ where: { userId: user.id } });
  await prisma.workspaceMembership.deleteMany();
  await prisma.workspace.deleteMany();

  const teammateHash = await bcrypt.hash("teamdemo123", 10);
  const teammates = await Promise.all([
    prisma.user.upsert({
      where: { email: "aisha@invisiblecrm.local" },
      update: {
        name: "Aisha Khan",
        passwordHash: teammateHash
      },
      create: {
        email: "aisha@invisiblecrm.local",
        name: "Aisha Khan",
        passwordHash: teammateHash,
        onboardingCompleted: true
      }
    }),
    prisma.user.upsert({
      where: { email: "vivek@invisiblecrm.local" },
      update: {
        name: "Vivek Rao",
        passwordHash: teammateHash
      },
      create: {
        email: "vivek@invisiblecrm.local",
        name: "Vivek Rao",
        passwordHash: teammateHash,
        onboardingCompleted: true
      }
    })
  ]);

  const workspace = await prisma.workspace.create({
    data: {
      ownerUserId: user.id,
      name: "Invisible CRM Demo Workspace",
      memberships: {
        create: [
          {
            userId: user.id,
            role: WorkspaceRole.OWNER
          },
          {
            userId: teammates[0].id,
            invitedByUserId: user.id,
            role: WorkspaceRole.ADMIN
          },
          {
            userId: teammates[1].id,
            invitedByUserId: user.id,
            role: WorkspaceRole.MEMBER
          }
        ]
      }
    }
  });

  const companies = await Promise.all(
    [
      { name: "ABC Studio", industry: "Creative Agency", website: "https://abcstudio.example.com" },
      { name: "Northline Fitness", industry: "Local Services", website: "https://northline.example.com" },
      { name: "Bright Ledger", industry: "Fintech SaaS", website: "https://brightledger.example.com" }
    ].map((company) =>
      prisma.company.create({
        data: {
          userId: user.id,
          ...company
        }
      })
    )
  );

  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        userId: user.id,
        companyId: companies[0].id,
        name: "Neha Sharma",
        email: "neha@abcstudio.example.com",
        phone: "+91 98765 44001",
        source: "Referral",
        tags: ["High intent", "Design"]
      }
    }),
    prisma.contact.create({
      data: {
        userId: user.id,
        companyId: companies[1].id,
        name: "Rahul Verma",
        email: "rahul@northline.example.com",
        phone: "+91 98765 44002",
        source: "Instagram",
        tags: ["Follow-up", "Operations"]
      }
    }),
    prisma.contact.create({
      data: {
        userId: user.id,
        companyId: companies[2].id,
        name: "Priya Menon",
        email: "priya@brightledger.example.com",
        phone: "+91 98765 44003",
        source: "Website",
        tags: ["Warm", "SaaS"]
      }
    }),
    prisma.contact.create({
      data: {
        userId: user.id,
        name: "Aman Sethi",
        email: "aman@independent.example.com",
        phone: "+91 98765 44004",
        source: "Cold outreach",
        tags: ["Consulting"]
      }
    })
  ]);

  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        userId: user.id,
        contactId: contacts[0].id,
        companyId: companies[0].id,
        title: "Website redesign retainer",
        description: "Modernize the agency site and improve lead conversion.",
        stage: DealStage.PROPOSAL_SENT,
        assignedToUserId: teammates[0].id,
        amount: 80000,
        expectedCloseDate: addDays(new Date(), 6),
        nextStep: "Review proposal with Neha on Friday"
      }
    }),
    prisma.deal.create({
      data: {
        userId: user.id,
        contactId: contacts[1].id,
        companyId: companies[1].id,
        title: "CRM setup for sales team",
        description: "Replace spreadsheets with a lighter sales workflow.",
        stage: DealStage.QUALIFIED,
        assignedToUserId: teammates[1].id,
        amount: 50000,
        expectedCloseDate: addDays(new Date(), 10),
        nextStep: "Call Rahul about onboarding flow"
      }
    }),
    prisma.deal.create({
      data: {
        userId: user.id,
        contactId: contacts[2].id,
        companyId: companies[2].id,
        title: "Outbound process audit",
        description: "Two-week consulting engagement for pipeline cleanup.",
        stage: DealStage.NEGOTIATION,
        assignedToUserId: user.id,
        amount: 120000,
        expectedCloseDate: addDays(new Date(), 14),
        nextStep: "Send revised scope"
      }
    })
  ]);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        userId: user.id,
        contactId: contacts[1].id,
        dealId: deals[1].id,
        assignedToUserId: teammates[1].id,
        title: "Call Rahul about the proposal",
        dueDate: addDays(new Date(), 1),
        priority: TaskPriority.HIGH,
        recurrencePattern: TaskRecurrencePattern.WEEKLY,
        recurrenceSeriesId: "demo-weekly-rahul"
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        contactId: contacts[0].id,
        dealId: deals[0].id,
        assignedToUserId: teammates[0].id,
        title: "Send proposal deck to Neha",
        dueDate: addDays(new Date(), 2),
        priority: TaskPriority.HIGH
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        contactId: contacts[2].id,
        dealId: deals[2].id,
        assignedToUserId: user.id,
        title: "Share updated scope",
        dueDate: subDays(new Date(), 1),
        priority: TaskPriority.MEDIUM
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        contactId: contacts[3].id,
        assignedToUserId: teammates[1].id,
        title: "Check in with Aman",
        dueDate: subDays(new Date(), 2),
        priority: TaskPriority.LOW,
        status: TaskStatus.COMPLETED,
        completedAt: subDays(new Date(), 1)
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        contactId: contacts[0].id,
        dealId: deals[0].id,
        assignedToUserId: teammates[0].id,
        title: "Monthly relationship check-in with Neha",
        dueDate: addDays(new Date(), 5),
        priority: TaskPriority.MEDIUM,
        recurrencePattern: TaskRecurrencePattern.MONTHLY,
        recurrenceSeriesId: "demo-monthly-neha"
      }
    })
  ]);

  const notes = await Promise.all([
    prisma.note.create({
      data: {
        userId: user.id,
        contactId: contacts[0].id,
        dealId: deals[0].id,
        content: "Neha wants the proposal to emphasize speed, trust, and fewer admin steps.",
        source: "meeting"
      }
    }),
    prisma.note.create({
      data: {
        userId: user.id,
        contactId: contacts[1].id,
        dealId: deals[1].id,
        content: "Rahul currently tracks leads in WhatsApp and a spreadsheet. Biggest pain is follow-up leakage.",
        source: "call"
      }
    }),
    prisma.note.create({
      data: {
        userId: user.id,
        contactId: contacts[2].id,
        dealId: deals[2].id,
        content: "Priya is evaluating two consultants and wants a faster rollout plan.",
        source: "meeting"
      }
    })
  ]);

  const conversations = await Promise.all([
    prisma.conversationLog.create({
      data: {
        userId: user.id,
        contactId: contacts[1].id,
        dealId: deals[1].id,
        source: ConversationSource.WHATSAPP,
        subject: "CRM rollout follow-up",
        participantLabel: "Rahul Verma • Northline Fitness",
        summary: "Rahul wants the final CRM rollout proposal by Friday and confirmed a 50k budget range.",
        rawText:
          "Rahul: We want to move next week if the proposal is clear.\nYou: I can send the final version by Friday.\nRahul: Great, budget is still around 50k.",
        actionItems: ["Send final proposal by Friday", "Confirm onboarding timeline"]
      }
    }),
    prisma.conversationLog.create({
      data: {
        userId: user.id,
        contactId: contacts[0].id,
        dealId: deals[0].id,
        source: ConversationSource.EMAIL,
        subject: "Landing page scope request",
        participantLabel: "Neha Sharma • ABC Studio",
        summary: "Neha asked for the updated proposal to include landing page copy and confirmed they want to start this month.",
        rawText:
          "Neha,\nCould you include the landing page copy in the updated proposal? We still want to move this month if the revised scope looks right.\nThanks,\nNeha",
        actionItems: ["Update proposal with landing page copy", "Confirm kickoff date"]
      }
    })
  ]);

  await prisma.invoice.createMany({
    data: [
      {
        workspaceId: workspace.id,
        contactId: contacts[0].id,
        dealId: deals[0].id,
        number: "INV-2026-014",
        clientName: "ABC Studio",
        amount: 40000,
        currency: "INR",
        status: InvoiceStatus.SENT,
        issueDate: subDays(new Date(), 2),
        dueDate: addDays(new Date(), 10),
        notes: "First milestone invoice for redesign kickoff."
      },
      {
        workspaceId: workspace.id,
        contactId: contacts[2].id,
        dealId: deals[2].id,
        number: "INV-2026-015",
        clientName: "Bright Ledger",
        amount: 60000,
        currency: "INR",
        status: InvoiceStatus.DRAFT,
        issueDate: new Date(),
        dueDate: addDays(new Date(), 14),
        notes: "Draft invoice pending scope sign-off."
      }
    ]
  });

  const [emailIntegration, whatsappIntegration] = await Promise.all([
    prisma.integrationConnection.create({
      data: {
        workspaceId: workspace.id,
        provider: IntegrationProvider.EMAIL_IMAP,
        name: "Primary inbox",
        status: IntegrationStatus.NEEDS_ATTENTION,
        config: {
          host: "imap.gmail.com",
          port: 993,
          secure: true,
          username: "founder@example.com",
          password: "update-me",
          mailbox: "INBOX"
        },
        lastSyncMessage: "Add real mailbox credentials to enable live sync."
      }
    }),
    prisma.integrationConnection.create({
      data: {
        workspaceId: workspace.id,
        provider: IntegrationProvider.WHATSAPP_META,
        name: "Primary WhatsApp",
        status: IntegrationStatus.NEEDS_ATTENTION,
        config: {
          phoneNumberId: "1234567890",
          verifyToken: "demo-whatsapp-token",
          accessToken: "update-me"
        },
        lastSyncMessage: "Webhook ready. Replace demo credentials with your Meta values."
      }
    })
  ]);

  await prisma.automationRule.createMany({
    data: [
      {
        workspaceId: workspace.id,
        createdByUserId: user.id,
        name: "Proposal stage follow-up",
        triggerType: AutomationTriggerType.DEAL_STAGE_CHANGED,
        triggerConfig: { stage: DealStage.PROPOSAL_SENT },
        actionType: AutomationActionType.CREATE_TASK,
        actionConfig: {
          taskTitle: "Follow up on {{deal.title}}",
          taskDescription: "Check proposal feedback from {{contact.name}} and lock the next step.",
          dueInDays: 3,
          priority: TaskPriority.HIGH
        }
      },
      {
        workspaceId: workspace.id,
        createdByUserId: user.id,
        name: "Capture inbound context",
        triggerType: AutomationTriggerType.CONVERSATION_CAPTURED,
        actionType: AutomationActionType.ADD_NOTE,
        actionConfig: {
          noteContent: "Automation note: inbound conversation captured - {{conversation.summary}}"
        }
      }
    ]
  });

  await prisma.backgroundJob.createMany({
    data: [
      {
        workspaceId: workspace.id,
        integrationConnectionId: emailIntegration.id,
        type: JobType.SYNC_EMAIL,
        status: JobStatus.SUCCEEDED,
        payload: { connectionId: emailIntegration.id },
        attempts: 1,
        finishedAt: subDays(new Date(), 1)
      },
      {
        workspaceId: workspace.id,
        integrationConnectionId: whatsappIntegration.id,
        type: JobType.PROCESS_WHATSAPP,
        status: JobStatus.QUEUED,
        payload: { demo: true }
      }
    ]
  });

  await prisma.activity.createMany({
    data: [
      {
        userId: user.id,
        type: "CONTACT_CREATED",
        title: "Neha Sharma was added to contacts",
        description: "Referral lead from ABC Studio",
        entityType: "contact",
        entityId: contacts[0].id,
        contactId: contacts[0].id,
        createdAt: subDays(new Date(), 5)
      },
      {
        userId: user.id,
        type: "DEAL_CREATED",
        title: "Created deal: Website redesign retainer",
        description: "Estimated value 80,000 INR",
        entityType: "deal",
        entityId: deals[0].id,
        contactId: contacts[0].id,
        dealId: deals[0].id,
        createdAt: subDays(new Date(), 5)
      },
      {
        userId: user.id,
        type: "NOTE_ADDED",
        title: "Meeting note added for Neha Sharma",
        description: notes[0].content,
        entityType: "note",
        entityId: notes[0].id,
        contactId: contacts[0].id,
        dealId: deals[0].id,
        noteId: notes[0].id,
        createdAt: subDays(new Date(), 2)
      },
      {
        userId: user.id,
        type: "TASK_CREATED",
        title: "Created task: Call Rahul about the proposal",
        description: "Due tomorrow • Repeats weekly",
        entityType: "task",
        entityId: tasks[0].id,
        contactId: contacts[1].id,
        dealId: deals[1].id,
        taskId: tasks[0].id,
        createdAt: subDays(new Date(), 1)
      },
      {
        userId: user.id,
        type: "CONVERSATION_CAPTURED",
        title: "WhatsApp conversation captured",
        description: "Rahul wants the final proposal by Friday and confirmed the budget range.",
        entityType: "conversation",
        entityId: conversations[0].id,
        contactId: contacts[1].id,
        dealId: deals[1].id,
        createdAt: subDays(new Date(), 1)
      },
      {
        userId: user.id,
        type: "TEAM_MEMBER_ADDED",
        title: "Added teammate: Aisha Khan",
        description: "Role: ADMIN",
        entityType: "user",
        entityId: teammates[0].id,
        createdAt: subDays(new Date(), 2)
      },
      {
        userId: user.id,
        type: "INVOICE_SYNCED",
        title: "Tracked invoice: INV-2026-014",
        description: "ABC Studio • 40,000 INR",
        entityType: "note",
        entityId: "seed-invoice-activity",
        contactId: contacts[0].id,
        dealId: deals[0].id,
        createdAt: subDays(new Date(), 1)
      },
      {
        userId: user.id,
        type: "TASK_COMPLETED",
        title: "Completed task: Check in with Aman",
        description: "Closed the task after a follow-up note",
        entityType: "task",
        entityId: tasks[3].id,
        contactId: contacts[3].id,
        taskId: tasks[3].id,
        createdAt: subDays(new Date(), 1)
      }
    ]
  });

  console.log("Seed complete");
  console.log(`Demo user: ${email}`);
  console.log(`Demo password: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
