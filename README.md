# Invisible CRM

Invisible CRM is an AI-first CRM MVP for very small businesses that want deal tracking, follow-ups, and notes without enterprise-style setup or admin drag.

The product is built around one core idea:

> CRM should work for the user instead of making the user work for the CRM.

## What’s inside

- Dashboard with pipeline stats, today’s tasks, upcoming follow-ups, and recent activity
- Shared workspace with teammate accounts, roles, and record assignments
- Contacts with notes, linked deals/tasks, and activity timeline
- Deals pipeline with stage movement and deal detail pages
- Tasks with views for all, today, overdue, and completed
- Lightweight automations triggered by stage changes, task completion, and inbound conversations
- AI quick capture that turns natural language into contact/deal/task/note previews before save
- Inbox capture for WhatsApp chats, email threads, and rough conversation notes
- Meeting transcript import with AI/fallback summary and CRM action extraction
- CSV contact import with preview, duplicate checks, and controlled apply step
- Integration settings for IMAP email sync, WhatsApp webhook intake, and background job processing
- Invoice tracking plus multi-sheet workbook export for spreadsheet/accounting workflows
- Reminders center for overdue tasks, stale deals, and opportunities missing next steps
- Recurring follow-ups that auto-schedule the next task when one is completed
- Global search across contacts, deals, tasks, and captured conversations
- Seeded demo workspace so the app feels alive immediately
- Email/password auth with a seeded demo user
- Unit and integration tests for date parsing, fallback capture parsing, and capture application flow

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite for runnable local bootstrap
- OpenAI API for optional AI extraction
- Vitest for tests

## Local setup

The repo already includes a working `.env` for local use.

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client

```bash
npm run db:generate
```

3. Create the local SQLite database from the checked-in migration

```bash
npm run db:push
```

4. Seed the demo workspace

```bash
npm run db:seed
```

5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo login

- Email: `demo@invisiblecrm.local`
- Password: `demo12345`

Additional seeded teammates:

- `aisha@invisiblecrm.local` / `teamdemo123`
- `vivek@invisiblecrm.local` / `teamdemo123`

## Scripts

- `npm run dev` starts the Next.js dev server
- `npm run build` runs Prisma generate and builds the production app
- `npm run build:pg` renders the Postgres schema, generates Prisma client, and builds for hosted Postgres environments
- `npm run start` starts the production server after build
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript checks
- `npm test` runs Vitest with coverage
- `npm run db:generate` regenerates Prisma client
- `npm run db:generate:pg` regenerates Prisma client against the Postgres schema
- `npm run db:push` applies the checked-in SQLite migration
- `npm run db:push:pg` pushes the Postgres schema to a hosted PostgreSQL database
- `npm run db:migrate` aliases the same local bootstrap path
- `npm run db:seed` seeds demo data
- `npm run jobs:worker` processes queued background jobs

## AI quick capture behavior

Quick capture works in two layers:

1. OpenAI parsing when `OPENAI_API_KEY` is available
2. Deterministic fallback parsing when OpenAI is missing or invalid

That means the app still works in demo mode without any API key.

Example inputs:

- `Call Rahul tomorrow about the proposal`
- `Met Neha today from ABC Studio, interested in website redesign, budget 80k, send proposal Friday`
- `Sent quote to Aman, waiting for response`

The system parses these into a preview containing:

- contact suggestion
- deal suggestion
- task suggestion
- note
- confidence
- missing fields
- suggested updates

Nothing is written until the user confirms the preview.

## New real-user workflows

### Transcript import

Open `/imports/transcript` to paste a meeting or sales transcript. The app will:

- summarize the meeting
- surface key takeaways
- extract action items
- propose contact, deal, task, and note updates
- let the user review before saving

### Inbox capture

Open `/inbox` to paste a WhatsApp chat, email thread, or rough conversation note. The app will:

- summarize the conversation
- identify action items
- propose contact, deal, task, and note updates
- save a conversation log alongside the CRM updates
- let the user review everything before saving

### Shared workspace and assignments

Open `/team` to:

- add teammate accounts into one shared workspace
- assign roles like `OWNER`, `ADMIN`, `MEMBER`, and `VIEWER`
- use assignment fields on deals and tasks so ownership is visible

### Integrations

Open `/integrations` to:

- connect an IMAP inbox for native email sync
- configure a WhatsApp webhook endpoint for Meta-style inbound capture
- queue and process background sync jobs

The app runs without real credentials, but these integrations become live once valid mailbox or WhatsApp settings are added.

### Automations

Open `/automations` to create lightweight rules such as:

- when a deal moves to `Proposal Sent`, create a follow-up task in 3 days
- when a conversation is captured, add a standard note
- when a task is completed, create a downstream follow-up

### Finance and spreadsheet workflows

Open `/finance` to:

- track invoices linked to contacts and deals
- keep simple commercial context beside CRM activity
- export the whole workspace to a multi-sheet `.xlsx` workbook for spreadsheet/accounting workflows

### CSV import

Open `/imports/contacts` to import spreadsheet contacts. The import flow:

- accepts pasted CSV or uploaded CSV files
- detects common headers like `Name`, `Email`, `Phone`, `Company`, `Source`, and `Tags`
- previews creates, updates, and skips
- dedupes by email first, then by name plus company

### Reminders center

Open `/reminders` for the operational follow-up view:

- overdue tasks
- upcoming tasks this week
- recurring follow-up systems
- stale open deals
- deals missing a next step

### Recurring follow-ups

Tasks can now repeat on:

- daily cadence
- weekly cadence
- every 2 weeks
- monthly cadence
- custom every-X-days cadence

When a recurring task is completed, the next task in the series is created automatically.

## Architecture

### App structure

- `src/app` contains App Router pages and API routes
- `src/components` contains UI primitives, forms, and interactive workspace components
- `src/features` contains service-layer logic for contacts, deals, tasks, dashboard, search, notes, and AI capture
- `src/features/inbox` contains the message-to-CRM workflow for WhatsApp/email-style capture
- `src/features/team` contains shared workspace membership logic
- `src/features/integrations` contains IMAP sync and WhatsApp webhook ingestion
- `src/features/automations` contains trigger/action automation rules
- `src/features/jobs` contains the background job queue
- `src/features/finance` contains invoice tracking
- `src/lib` contains shared auth, schema validation, Prisma, formatting, date parsing, and activity helpers
- `prisma/schema.prisma` defines the runtime data model
- `prisma/migrations/.../migration.sql` contains the local bootstrap schema

### Core data model

- `User`
- `Session`
- `Company`
- `Workspace`
- `WorkspaceMembership`
- `Contact`
- `Deal`
- `Task`
- `IntegrationConnection`
- `AutomationRule`
- `BackgroundJob`
- `Invoice`
- `ConversationLog`
- `Note`
- `Activity`
- `ParsedCapture`

### Activity model

Every meaningful action writes to `Activity`, including:

- contact create/update/delete
- deal create/update/stage-change/delete
- task create/update/complete/delete
- recurring follow-up scheduling
- note additions
- AI capture application
- inbox conversation captures
- team member additions
- automation runs
- invoice tracking events
- onboarding completion

## Important tradeoffs

- Local bootstrap is SQLite-first because friction matters most for MVP testing.
- Prisma is still the runtime ORM, but the local schema bootstrap uses a checked-in SQLite migration script instead of Prisma’s schema engine because that engine was unreliable in this environment.
- The architecture is ready for PostgreSQL-oriented growth at the service/model level, but this repo currently ships a single runnable SQLite path to keep setup dependable.
- Auth is intentionally simple and replaceable rather than deeply framework-coupled.
- Hosted Postgres support is now exposed through a generated `prisma/schema.postgres.prisma` path plus `db:generate:pg`, `db:push:pg`, and `build:pg` scripts.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:

- hosted PostgreSQL setup
- separate worker setup
- inline vs queued job processing

## Verification

The following were run successfully:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm test`

## Roadmap

See:

- [PRODUCT_STRATEGY.md](./PRODUCT_STRATEGY.md)
- [TODO_ROADMAP.md](./TODO_ROADMAP.md)
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
