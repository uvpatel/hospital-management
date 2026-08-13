# HMS Agent Specification Pack

This directory contains the implementation contract for a full Hospital Management System.

Start with `AGENTS.md`, then follow its read order.

## Intended Stack

- Next.js App Router + TypeScript
- PostgreSQL
- Drizzle ORM / Drizzle Kit
- Zod
- shadcn/ui
- Tailwind CSS
- Vitest
- Playwright

## Core Rule

No fake/static business records inside the application. Development/demo records are created through `db/seed.ts`.

## Documents

- `PLAN.md` — master implementation plan.
- `AGENTS.md` — instructions for Gemini CLI/coding agents.
- `ARCHITECTURE.md` — layering and dependency rules.
- `DIRECTORY_STRUCTURE.md` — target source tree.
- `DATABASE.md` — domain-separated database design.
- `API.md` — API contracts and endpoint inventory.
- `ROUTES.md` — application routing map.
- `UI_RULES.md` — shadcn/ui and UX requirements.
- `WORKFLOWS.md` — business state/workflow rules.
- `SEED.md` — deterministic seed strategy.
- `SECURITY.md` — authentication, authorization, data protection.
- `TESTING.md` — automated testing strategy.
- `ENVIRONMENT.md` — environment/secrets conventions.
- `DEFINITION_OF_DONE.md` — mandatory completion checklist.
