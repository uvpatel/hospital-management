# Definition of Done

The coding agent must complete this checklist before claiming the full application is finished.

## Architecture

- [ ] App uses Next.js App Router.
- [ ] TypeScript strict mode enabled.
- [ ] `db/schema/` is domain-segregated.
- [ ] `db/queries/` is domain-segregated.
- [ ] Business workflows live in service modules where required.
- [ ] No large business logic exists in route handlers.

## Database

- [ ] All required tables implemented.
- [ ] Relations implemented.
- [ ] Foreign keys implemented.
- [ ] Unique constraints implemented.
- [ ] Check constraints added where appropriate.
- [ ] Indexes added for key lookups/filter paths.
- [ ] Migration applies to an empty database.
- [ ] Seed completes successfully.
- [ ] No negative medicine stock can be produced.
- [ ] No double active bed allocation can be produced.

## Data Integrity

- [ ] No static patients/doctors/appointments/invoices/reports in UI code.
- [ ] Dashboard metrics come from DB.
- [ ] Reports come from DB.
- [ ] Invoice totals are server authoritative.
- [ ] Payment totals/status are server authoritative.
- [ ] Appointment conflicts are rechecked server-side.
- [ ] Bed availability is rechecked transactionally.
- [ ] Pharmacy availability is rechecked transactionally.

## API

- [ ] `/api/v1` convention followed.
- [ ] Zod validates request input.
- [ ] Protected endpoints require authentication.
- [ ] Protected actions require permissions.
- [ ] Error response format is consistent.
- [ ] Pagination is server-side.
- [ ] Sort fields are allowlisted.
- [ ] Generic arbitrary status mutation endpoints do not exist for controlled workflows.

## UI

- [ ] shadcn/ui primitives used consistently.
- [ ] Sidebar/nav is permission aware.
- [ ] Every list has loading/error/empty state.
- [ ] Every important form has pending/success/error states.
- [ ] Destructive actions use confirmation.
- [ ] Tables paginate from the server.
- [ ] Mobile/tablet layout is usable.
- [ ] Accessibility basics verified.

## Workflows

- [ ] Patient registration works.
- [ ] Appointment booking works.
- [ ] Check-in works.
- [ ] Encounter workflow works.
- [ ] Diagnosis/prescription works.
- [ ] Admission/bed allocation works.
- [ ] Bed transfer works.
- [ ] Discharge frees bed.
- [ ] Lab order/result works.
- [ ] Pharmacy receiving works.
- [ ] Dispensing decrements stock correctly.
- [ ] Invoice issue works.
- [ ] Payment updates invoice correctly.
- [ ] Expenses work.
- [ ] Reports work.
- [ ] User/RBAC admin works.
- [ ] Audit log viewer works.

## Security

- [ ] Passwords are hashed if credentials auth is used.
- [ ] Sessions/cookies configured securely.
- [ ] No secrets committed.
- [ ] No sensitive values logged.
- [ ] Patient document access is authorized.
- [ ] Role hiding in UI is not used as the only access control.
- [ ] Audit events exist for sensitive workflows.

## Automated Verification

- [ ] `pnpm typecheck` passes.
- [ ] `pnpm lint` passes.
- [ ] `pnpm test` passes.
- [ ] Critical `pnpm test:e2e` flows pass.
- [ ] `pnpm build` passes.

## Manual Verification

- [ ] Fresh clone can be configured from README + `.env.example`.
- [ ] Fresh DB migration works.
- [ ] Seed works.
- [ ] Each seeded role can log in.
- [ ] Forbidden menus/actions are hidden for usability.
- [ ] Direct forbidden endpoint requests return 403.
- [ ] No screen shows placeholder business metrics after seed/database is available.

If any checkbox is false, do not report the application as fully complete.
