# Testing Strategy

## Test Pyramid

### Unit Tests

Test pure business rules:
- Status transition validation.
- Invoice calculations.
- Payment balance calculations.
- Slot generation.
- Permission helpers.
- DTO mapping.
- Validation schemas.

### Integration Tests

Use a real disposable PostgreSQL test database where possible.

Test:
- Query functions.
- Unique constraints.
- Transactions.
- Bed allocation concurrency behavior.
- Inventory decrement and insufficient stock.
- Invoice/payment recomputation.
- Appointment conflicts.
- RBAC on route handlers/services.

### E2E Tests

Critical Playwright flows:

1. Admin login and dashboard.
2. Receptionist creates patient.
3. Receptionist books appointment.
4. Receptionist checks in patient.
5. Doctor starts/completes consultation and prescription.
6. Lab technician completes lab order.
7. Pharmacist dispenses prescription.
8. Cashier receives payment.
9. Admission with bed allocation and transfer.
10. Discharge frees bed.
11. Unauthorized role cannot access forbidden operation.

## Test Data

Do not depend on development seed state for every automated test. Integration/E2E setup should create deterministic isolated test data or reset/seed a dedicated test DB.

## Regression Cases

Must cover:
- Duplicate patient/business number prevented.
- Two users cannot allocate the same bed.
- Two dispensations cannot oversell the same stock.
- Invalid appointment status transition rejected.
- Payment cannot produce invalid invoice balance.
- Client-modified invoice totals ignored/rejected.
- Unauthorized API request returns 401/403.
- Missing resource returns 404.
- Invalid query sort field rejected/defaulted safely.

## Quality Commands

Add scripts:

```text
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

CI should run at minimum typecheck, lint, unit/integration tests, and build. Run E2E in a suitable CI job with PostgreSQL and the app started in test mode.
