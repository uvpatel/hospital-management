# Database Seeding

## Goal

`db/seed.ts` is the only source of demo/development business records. Application code must never embed fake patient, doctor, appointment, inventory, invoice, or report records.

## Properties

Seed must be:
- Deterministic.
- Repeatable on a clean database.
- Referentially valid.
- Realistic enough to exercise UI states.
- Safe: refuse to run against production unless an explicit, strongly guarded mechanism exists.

## Seed Order

1. Hospital settings.
2. Permissions.
3. Roles.
4. Users.
5. User-role assignments.
6. Departments.
7. Doctors.
8. Doctor schedules.
9. Patients.
10. Appointments.
11. Encounters, diagnoses, prescriptions.
12. Wards, rooms, beds.
13. Admissions and allocations.
14. Lab catalog/orders/results.
15. Medicines/batches/inventory.
16. Dispensations.
17. Charge catalog/invoices/items/payments.
18. Expenses.

## Required Seed Scenarios

Ensure demo data includes:
- Active and inactive users.
- Every initial role.
- Multiple departments and doctors.
- Patients with varied age/sex/blood groups.
- Today/future/past appointments.
- Appointment statuses: scheduled, checked-in, completed, cancelled, no-show.
- At least one active encounter and completed encounter.
- Prescription pending and dispensed.
- Available and occupied beds.
- Active and discharged admissions.
- Pending and completed lab orders.
- Medicine batches with healthy stock, low stock, and near-expiry examples.
- Draft, issued, partially-paid, and paid invoices.
- Expenses across categories/date range.

## Credentials

Development seed may create documented test accounts, but passwords must come from safe development defaults/environment and be hashed. Never reuse production passwords or secrets.

Suggested dev personas:
- admin
- receptionist
- doctor
- nurse
- lab technician
- pharmacist
- cashier/accountant

Document development-only credentials in local developer documentation, not production UI.

## Package

Using Drizzle's deterministic seeding tooling is acceptable, but domain rules and relationships must still be explicitly controlled. A custom deterministic seed implementation is also acceptable.

## Commands

`package.json` should expose:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx db/seed.ts"
  }
}
```

Adjust only if the chosen Drizzle setup requires a compatible equivalent.
