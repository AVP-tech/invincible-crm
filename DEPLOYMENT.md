# Deployment Notes

## Local default

The repo stays SQLite-first for the fastest local setup:

- `npm run db:generate`
- `npm run db:push`
- `npm run db:seed`
- `npm run dev`

## Hosted PostgreSQL path

For hosted environments, the repo now includes a generated Postgres Prisma schema path.

Use:

```bash
npm run db:generate:pg
npm run db:push:pg
npm run build:pg
```

Required environment variables:

- `DATABASE_URL` pointing to your hosted PostgreSQL database
- `SESSION_SECRET`
- optional `OPENAI_API_KEY`
- optional `RUN_JOBS_INLINE=false` if you want a separate worker process

## Background jobs

In local dev, jobs run inline by default for simplicity.

For a more production-like setup:

- set `RUN_JOBS_INLINE=false`
- run the web app normally
- run the worker separately with:

```bash
npm run jobs:worker
```

This worker currently processes queued sync jobs such as email sync and WhatsApp ingestion.
