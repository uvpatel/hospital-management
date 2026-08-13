# Directory Structure

Use the following structure as the target. Domain-specific additions may be made without flattening the architecture.

```text
.
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── patients/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [patientId]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   ├── doctors/
│   │   ├── departments/
│   │   ├── appointments/
│   │   ├── encounters/
│   │   ├── admissions/
│   │   ├── wards/
│   │   ├── laboratory/
│   │   ├── pharmacy/
│   │   ├── billing/
│   │   ├── expenses/
│   │   ├── reports/
│   │   └── admin/
│   ├── api/
│   │   └── v1/
│   │       ├── patients/
│   │       ├── doctors/
│   │       ├── departments/
│   │       ├── appointments/
│   │       ├── encounters/
│   │       ├── admissions/
│   │       ├── laboratory/
│   │       ├── pharmacy/
│   │       ├── invoices/
│   │       ├── payments/
│   │       ├── expenses/
│   │       └── admin/
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── not-found.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                 # shadcn/ui generated primitives
│   ├── layout/
│   ├── data-table/
│   ├── forms/
│   └── domain/
│       ├── patients/
│       ├── appointments/
│       ├── admissions/
│       ├── laboratory/
│       ├── pharmacy/
│       └── billing/
├── db/
│   ├── index.ts
│   ├── seed.ts
│   ├── seed/
│   │   ├── constants.ts
│   │   ├── identity.seed.ts
│   │   ├── clinical.seed.ts
│   │   ├── inpatient.seed.ts
│   │   ├── lab.seed.ts
│   │   ├── pharmacy.seed.ts
│   │   └── billing.seed.ts
│   ├── schema/
│   │   ├── index.ts
│   │   ├── common.ts
│   │   ├── auth.ts
│   │   ├── organization.ts
│   │   ├── patients.ts
│   │   ├── clinical.ts
│   │   ├── inpatient.ts
│   │   ├── laboratory.ts
│   │   ├── pharmacy.ts
│   │   ├── billing.ts
│   │   └── audit.ts
│   └── queries/
│       ├── index.ts
│       ├── patients.queries.ts
│       ├── doctors.queries.ts
│       ├── appointments.queries.ts
│       ├── encounters.queries.ts
│       ├── admissions.queries.ts
│       ├── beds.queries.ts
│       ├── laboratory.queries.ts
│       ├── pharmacy.queries.ts
│       ├── billing.queries.ts
│       ├── reports.queries.ts
│       └── admin.queries.ts
├── lib/
│   ├── auth/
│   │   ├── auth.ts
│   │   ├── permissions.ts
│   │   └── session.ts
│   ├── api/
│   │   ├── client.ts
│   │   ├── errors.ts
│   │   └── response.ts
│   ├── services/
│   │   ├── patients.service.ts
│   │   ├── appointments.service.ts
│   │   ├── encounters.service.ts
│   │   ├── admissions.service.ts
│   │   ├── laboratory.service.ts
│   │   ├── dispensing.service.ts
│   │   ├── billing.service.ts
│   │   └── audit.service.ts
│   ├── validations/
│   │   ├── common.ts
│   │   ├── patients.ts
│   │   ├── appointments.ts
│   │   ├── admissions.ts
│   │   ├── laboratory.ts
│   │   ├── pharmacy.ts
│   │   └── billing.ts
│   ├── constants/
│   ├── env.ts
│   └── utils.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── fixtures/
│   └── e2e/
├── drizzle/
├── public/
├── components.json
├── drizzle.config.ts
├── middleware.ts          # only if required by chosen auth approach
├── .env.example
├── AGENTS.md
└── package.json
```

## Route Group Rule

Use route groups such as `(auth)` and `(dashboard)` for layout organization without changing public URLs.

## Dynamic Segment Naming

Use explicit names:

- `[patientId]`
- `[appointmentId]`
- `[admissionId]`
- `[invoiceId]`

Avoid generic `[id]` in deeply nested code because it reduces readability.
