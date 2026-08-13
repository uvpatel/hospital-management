# Architecture

## Architectural Style

Use a modular monolith. Each domain has clear boundaries but runs inside one Next.js deployment and one PostgreSQL database.

## Layer Responsibilities

### Presentation

Files under `app/` and `components/`.

Responsibilities:
- Render views.
- Read URL state.
- Collect input.
- Display server/client validation messages.
- Trigger server actions/API clients.

Must not:
- Contain SQL/Drizzle queries.
- Calculate authoritative financial totals.
- Decide permissions without server confirmation.

### Transport / Action Boundary

Files under `app/api/**/route.ts` and optional `actions/`.

Responsibilities:
- Authenticate caller.
- Validate params/query/body.
- Authorize operation.
- Call service/query.
- Return standard response.

Must not become a large business-logic layer.

### Services

Files under `lib/services/` grouped by domain.

Responsibilities:
- Business workflows.
- State transitions.
- Transactions.
- Coordination across multiple query modules/domains.
- Audit events.

Examples:
- `appointment.service.ts`
- `admission.service.ts`
- `billing.service.ts`
- `dispensing.service.ts`

### Database Query Layer

Files under `db/queries/` grouped by domain.

Responsibilities:
- Drizzle reads/writes.
- Pagination/filter query composition.
- Database-specific aggregate queries.

Do not put HTTP, cookies, React, or UI concerns here.

### Database Schema Layer

Files under `db/schema/`.

Responsibilities:
- Tables.
- Enums.
- Constraints.
- Indexes.
- Relations.

## Data Flow

### Server-rendered read

`page.tsx -> service/query -> db -> PostgreSQL`

### Client-triggered mutation

`client component -> API client/server action -> auth -> validation -> service -> query -> db transaction -> audit -> response -> UI refresh`

## IDs and Business Numbers

- Primary keys: UUIDs generated server/database-side.
- Human-readable business numbers are separate columns, e.g. `patient_number`, `appointment_number`, `admission_number`, `invoice_number`, `lab_order_number`.
- Business numbers must be unique and generated server-side.
- Never expose sequential database IDs because the design uses UUIDs.

## Time

- Store instants in PostgreSQL timezone-aware timestamps.
- Store hospital timezone in settings.
- Convert for display at the presentation boundary.
- Never construct appointment availability solely in the browser.

## Money

- Use fixed precision database numeric/decimal representation, never floating-point for authoritative amounts.
- Pick a consistent minor-unit or decimal strategy and keep it across schema and billing code.
- Currency belongs to hospital/invoice context.

## State Machines

Statuses must transition through service functions. Do not perform arbitrary status updates from generic CRUD endpoints.

Examples:

Appointment:
`scheduled -> checked_in -> in_progress -> completed`

Also:
`scheduled -> cancelled`
`scheduled -> no_show`

Admission:
`admitted -> discharged`
`admitted -> cancelled` only when allowed and no conflicting activity.

Invoice:
`draft -> issued -> partially_paid -> paid`
with controlled `void` transition.

Lab order:
`ordered -> collected -> processing -> completed`
with controlled `cancelled` transition.

## Concurrency-Critical Operations

Use database transactions and conditional updates/locks where necessary for:

- Bed allocation/transfer.
- Appointment slot booking when enforcing unique slots.
- Inventory dispensing.
- Payment application and invoice recomputation.
- Business number generation if not using collision-resistant strategy.

## Caching

Correctness first. Do not cache security-sensitive or rapidly changing operational data until invalidation is explicit. After mutations, revalidate relevant routes/tags when Next.js caching is used.
