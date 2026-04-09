# Implementation Plan

## Product direction
- Build a calm, AI-first CRM optimized for micro teams that want fast capture and low setup.
- Keep the MVP local-first and demo-friendly: seeded data, SQLite bootstrap, optional OpenAI enrichment.
- Prefer a modular monolith in Next.js so product iteration stays fast without painting us into a corner.

## Architecture
- `Next.js App Router + TypeScript` for UI, API routes, and authenticated server rendering.
- `Prisma` with an env-driven datasource provider so local runs can use SQLite while deployments can switch to PostgreSQL.
- `Custom session auth` using email/password and a replaceable session layer, avoiding auth lock-in during MVP.
- `Service layer` for contacts, deals, tasks, activities, search, and AI capture orchestration.
- `OpenAI adapter + deterministic fallback parser` so the product still works without an API key.

## Delivery sequence
1. Scaffold app shell, config, Prisma schema, design system, and docs.
2. Build auth and shared workspace layout.
3. Implement contacts, deals, tasks, notes, activities, and search.
4. Implement AI quick capture preview and save flow.
5. Seed realistic demo data.
6. Add tests for parsing, date normalization, and capture/application flows.
7. Finalize README, strategy, and roadmap docs.
