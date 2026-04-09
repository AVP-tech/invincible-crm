# Product Strategy

## Target audience
- Micro businesses and service teams with 1-10 people.
- Founders, consultants, agencies, freelancers, and local operators who need follow-up discipline without enterprise overhead.

## Pain points solved
- Traditional CRMs force users into forms before value appears.
- Small teams lose leads because tasks, notes, and deal context live in chats, memory, or notebooks.
- Setup-heavy systems create abandonment before the first week.

## What makes this different
- The primary interaction is natural-language capture instead of record-by-record admin.
- The UI is intentionally calm and progressive rather than enterprise-dense.
- Activities, notes, and follow-ups are first-class, so the CRM feels like a working memory assistant.
- The AI layer is practical: extract structure, suggest next actions, and reduce typing.

## Assumptions
- MVP is optimized for a single workspace owner first, with schema and services prepared for later multi-user expansion.
- Manual signup is supported, but the seeded demo user is the fastest first-run path.
- SQLite is the default local bootstrap because friction matters more than infrastructure purity in early validation.
- Prisma does not support switching datasource providers from a single schema via env in the way this MVP needs, so the runnable repo ships a SQLite-first path and keeps PostgreSQL as the next infrastructure step.
- OpenAI is optional; when no API key is present, deterministic parsing still supports the most common commands.
- Contacts are the relationship anchor for v1, while company support stays lightweight and extensible.
- Real early users are likely migrating from spreadsheets and meeting notes, so CSV import and transcript import were prioritized ahead of analytics or advanced automations.
- Operational trust matters as much as data entry speed, so a reminders center was added to surface overdue tasks, stale deals, and opportunities without next steps.
- Real small-business teams also live in WhatsApp and email, so the next practical step was a manual inbox capture flow before full external API sync.
- Recurring follow-ups were prioritized over heavier workflow automation because small teams first need dependable cadence management, not a rules engine.
- Shared workspace support uses a pragmatic owner-based data scope under the hood so the repo could gain team collaboration without a full multi-tenant rewrite in one pass.
- Email sync uses IMAP as the practical first native path for small-business mailboxes.
- WhatsApp sync is built around inbound webhook intake first, which is the most realistic MVP slice before outbound messaging and richer provider workflows.
- Spreadsheet/accounting support is intentionally spreadsheet-friendly first: invoice tracking inside the CRM plus workbook export for finance-heavy teams that still live in Excel or Sheets.
- The first-load experience can be more theatrical than a typical B2B app because the product needs to emotionally separate itself from boring admin software while still keeping the in-product workspace calm and usable.
