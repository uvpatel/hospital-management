# Hospital Management System — Master Implementation Plan

## 1. Purpose

Build a production-oriented Hospital Management System (HMS) as a full-stack web application. The application must use real database-backed data for every business screen. Demo/development data must be inserted only through `db/seed.ts`; UI components, API handlers, server actions, query files, and page files must not contain hard-coded business records.

The implementation target is a maintainable modular monolith that can later be split into services if required.

## 2. Required Technology Stack

- Next.js App Router with TypeScript.
- React Server Components by default; Client Components only where browser interactivity is required.
- PostgreSQL.
- Drizzle ORM and Drizzle Kit.
- Zod for request, form, environment, and response-boundary validation where appropriate.
- shadcn/ui as the UI component foundation.
- Tailwind CSS through the shadcn-compatible project setup.
- Secure server-side authentication with database-backed user/session data.
- Role-based access control (RBAC).
- Vitest for unit/integration tests and Playwright for end-to-end tests.
- ESLint and TypeScript strict mode.

Do not replace the above stack without an explicit instruction from the project owner.

## 3. Product Scope

### Phase 1 — Foundation

- Project bootstrap and coding standards.
- Environment validation.
- PostgreSQL connection.
- Drizzle schema modules, relations, indexes, migrations, and seed.
- Authentication.
- RBAC.
- App shell, sidebar, breadcrumbs, command/search entry point, loading states, empty states, error states.
- Audit logging framework.

### Phase 2 — Core Hospital Operations

- Dashboard.
- Patients.
- Departments.
- Doctors.
- Staff users.
- Doctor schedules.
- Appointments.
- OPD encounters/visits.
- Diagnoses.
- Prescriptions.
- Patient documents.

### Phase 3 — Inpatient Operations

- Admissions.
- Wards.
- Rooms.
- Beds.
- Bed allocation and transfer history.
- Nursing/clinical notes.
- Discharge workflow.

### Phase 4 — Diagnostics and Pharmacy

- Lab test catalog.
- Lab orders and order items.
- Lab results.
- Medicine catalog.
- Medicine batches.
- Inventory transactions.
- Prescription dispensing.

### Phase 5 — Finance

- Charge catalog.
- Invoices.
- Invoice items.
- Payments.
- Refunds/adjustments when enabled.
- Expenses.
- Revenue and collection reports.

### Phase 6 — Administration and Reporting

- Users.
- Roles and permissions.
- Hospital settings.
- Audit log viewer.
- Operational reports.
- Finance reports.
- Export endpoints where authorized.

## 4. Non-Negotiable Engineering Rules

1. No business data may be hard-coded in page/component files.
2. Seed/demo data belongs in `db/seed.ts` and seed helper modules only.
3. Database tables must not be declared in one giant schema file. Use domain schema files under `db/schema/`.
4. Business queries must not be placed in route handlers or React components. Use domain query modules under `db/queries/`.
5. Route handlers must validate input, enforce authentication/authorization, call services/queries, and format a consistent response.
6. Do not trust IDs, totals, prices, statuses, roles, or ownership data received from the client.
7. All mutations that update multiple dependent records must use a database transaction.
8. Financial totals must be calculated server-side from authoritative database values.
9. Every list screen must support database-backed pagination. Search/filter/sort parameters must be validated.
10. Every protected operation must perform server-side permission checks even if the UI hides the action.
11. No direct `fetch('/api/...')` calls scattered throughout components. Use centralized API client functions/hooks where client fetching is necessary.
12. Prefer Server Components + query/service calls for initial reads. Use Route Handlers for external/client API boundaries and mutation endpoints where appropriate.
13. Use shadcn/ui primitives instead of creating parallel custom primitive components.
14. No `any` unless justified with a code comment and unavoidable external type boundary.
15. No empty catch blocks, swallowed errors, fake success responses, or TODO implementations in completed features.
16. No production route may depend on `seed.ts` running at request time.
17. Migrations are the source of database evolution. Never mutate production schema with ad hoc runtime SQL.
18. Destructive actions require confirmation and server-side permission validation.
19. Clinical, identity, billing, and audit data must not be physically deleted by ordinary UI flows unless explicitly designed. Prefer status/archival/void patterns.
20. The coding agent must run typecheck, lint, tests, and production build before declaring a milestone complete.

## 5. Domain Model Summary

Core domains:

- Identity & Access: users, roles, permissions, sessions.
- Organization: hospital settings, departments.
- Patients: patients, contacts, documents.
- Clinical: doctors, schedules, appointments, encounters, diagnoses, prescriptions.
- Inpatient: wards, rooms, beds, admissions, bed allocations, clinical notes, discharges.
- Laboratory: lab tests, lab orders, lab order items, lab results.
- Pharmacy: medicines, medicine batches, inventory transactions, dispensing.
- Billing: charge catalog, invoices, invoice items, payments, expenses.
- Audit: audit logs.

See `DATABASE.md` for authoritative schema design.

## 6. Application Layers

Use this dependency direction:

`UI/Page -> server action or API boundary -> service -> query/repository -> Drizzle -> PostgreSQL`

Reads rendered on the server may use:

`Server Component -> service/query -> Drizzle -> PostgreSQL`

Do not invert these dependencies. Query modules must not import UI. Schema modules must not import query modules.

## 7. Implementation Order

1. Create repository and install dependencies.
2. Configure TypeScript strict mode, linting, aliases, shadcn/ui, environment validation.
3. Implement `db/index.ts`, `db/schema/*`, schema barrel export, and relations.
4. Generate and apply initial migration.
5. Implement deterministic `db/seed.ts`.
6. Implement authentication and RBAC.
7. Implement shared API response/error conventions.
8. Implement application shell and navigation.
9. Implement Patients vertical slice end-to-end.
10. Implement Doctors/Departments/Schedules.
11. Implement Appointments.
12. Implement Encounters/Diagnoses/Prescriptions.
13. Implement Admissions/Bed management.
14. Implement Laboratory.
15. Implement Pharmacy.
16. Implement Billing/Payments/Expenses.
17. Implement Reports.
18. Implement Admin and Audit Logs.
19. Finish E2E tests, security review, accessibility review, and production build.

A vertical slice is complete only when schema, migration, seed, queries, service, validation, API/server action, UI, permissions, tests, loading/error/empty states, and audit behavior are complete.

## 8. Definition of a Completed Feature

A feature is complete only if all of the following are true:

- Database model and indexes exist.
- Migration generated and applies on a clean database.
- Seed covers the feature with relationally valid records.
- Query/service methods exist with typed inputs/outputs.
- Zod validation exists for mutation/search inputs.
- RBAC enforced on server.
- API response/error contract followed.
- UI uses shadcn/ui and contains no business fixtures.
- Loading, error, empty, unauthorized, and not-found behavior are handled.
- Mutation success and failure feedback are present.
- Audit log emitted for security-sensitive mutations.
- Unit/integration tests cover important rules.
- E2E happy path exists for critical flows.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.

## 9. Critical End-to-End Workflows

### Patient -> Appointment -> Consultation -> Prescription -> Invoice -> Payment

1. Receptionist searches for existing patient.
2. If absent, receptionist registers patient.
3. Appointment is created against a doctor and schedule.
4. Appointment transitions to checked-in.
5. Doctor starts an encounter.
6. Doctor records clinical information and diagnoses.
7. Doctor creates prescription if needed.
8. Encounter completes.
9. Billable charges create/update invoice items server-side.
10. Cashier records payment.
11. Invoice status is recomputed from authoritative totals.
12. Relevant mutations are written to audit log.

### Admission -> Bed -> Treatment -> Discharge -> Final Bill

1. Authorized staff creates admission from patient.
2. Available bed is locked/validated and allocated transactionally.
3. Bed status and allocation history update together.
4. Transfers close previous allocation and open next allocation transactionally.
5. Charges accumulate from authoritative services.
6. Discharge closes active allocation, marks bed available, creates discharge details, and finalizes relevant charges transactionally.

### Lab Order -> Result

1. Authorized clinician orders tests.
2. Lab receives pending order.
3. Lab technician updates collection/processing status.
4. Results are recorded per order item.
5. Order becomes completed only when required items are completed.
6. Results become visible to authorized clinical users/patient context.

### Prescription -> Dispensing -> Inventory

1. Doctor creates prescription.
2. Pharmacist views pending prescription.
3. Server selects/validates stock batches.
4. Dispensing and inventory decrement occur transactionally.
5. Negative stock is prohibited.
6. Inventory transaction history is immutable.

## 10. Completion Gate

Before the agent says “done”, execute the checklist in `DEFINITION_OF_DONE.md`. A visually complete UI with mocked data is explicitly considered incomplete.
