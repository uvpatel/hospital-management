# API Design

## General Rules

- Namespace HTTP APIs under `/api/v1`.
- Use Next.js App Router Route Handlers.
- JSON only unless endpoint is explicitly a file export/upload.
- Authenticate every protected endpoint.
- Authorize every protected operation server-side.
- Validate path params, query params, and body using Zod.
- Do not accept server-owned fields from clients.
- Use correct HTTP methods and status codes.
- Route handlers call services/queries; they do not contain large Drizzle queries.

## Standard Success Shape

```json
{
  "data": {},
  "meta": {}
}
```

`meta` is optional for non-list endpoints.

## Standard Error Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "fields": {}
  }
}
```

Never return raw database errors to clients.

## Pagination

List endpoints accept validated params:

- `page` default 1
- `pageSize` default 20, max 100
- `search` optional
- domain filters
- `sort` from allowlisted fields
- `order` = `asc | desc`

Response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

## Resource Endpoints

### Patients

- `GET /api/v1/patients`
- `POST /api/v1/patients`
- `GET /api/v1/patients/:patientId`
- `PATCH /api/v1/patients/:patientId`
- `GET /api/v1/patients/:patientId/appointments`
- `GET /api/v1/patients/:patientId/encounters`
- `GET /api/v1/patients/:patientId/admissions`
- `GET /api/v1/patients/:patientId/invoices`
- `POST /api/v1/patients/:patientId/documents`

Avoid ordinary DELETE for patients. Use active/archive workflow if required.

### Departments

- `GET /api/v1/departments`
- `POST /api/v1/departments`
- `GET /api/v1/departments/:departmentId`
- `PATCH /api/v1/departments/:departmentId`

### Doctors

- `GET /api/v1/doctors`
- `POST /api/v1/doctors`
- `GET /api/v1/doctors/:doctorId`
- `PATCH /api/v1/doctors/:doctorId`
- `GET /api/v1/doctors/:doctorId/schedules`
- `POST /api/v1/doctors/:doctorId/schedules`
- `PATCH /api/v1/doctors/:doctorId/schedules/:scheduleId`
- `GET /api/v1/doctors/:doctorId/availability?date=YYYY-MM-DD`

Availability must be computed from schedules + existing appointments + hospital timezone.

### Appointments

- `GET /api/v1/appointments`
- `POST /api/v1/appointments`
- `GET /api/v1/appointments/:appointmentId`
- `PATCH /api/v1/appointments/:appointmentId` for editable non-status fields
- `POST /api/v1/appointments/:appointmentId/check-in`
- `POST /api/v1/appointments/:appointmentId/start`
- `POST /api/v1/appointments/:appointmentId/complete`
- `POST /api/v1/appointments/:appointmentId/cancel`
- `POST /api/v1/appointments/:appointmentId/no-show`

Do not expose generic `status` PATCH that allows arbitrary transitions.

### Encounters

- `GET /api/v1/encounters`
- `POST /api/v1/encounters`
- `GET /api/v1/encounters/:encounterId`
- `PATCH /api/v1/encounters/:encounterId`
- `POST /api/v1/encounters/:encounterId/diagnoses`
- `POST /api/v1/encounters/:encounterId/prescriptions`
- `POST /api/v1/encounters/:encounterId/complete`

### Admissions and Beds

- `GET /api/v1/admissions`
- `POST /api/v1/admissions`
- `GET /api/v1/admissions/:admissionId`
- `POST /api/v1/admissions/:admissionId/allocate-bed`
- `POST /api/v1/admissions/:admissionId/transfer-bed`
- `POST /api/v1/admissions/:admissionId/notes`
- `POST /api/v1/admissions/:admissionId/discharge`
- `GET /api/v1/wards`
- `GET /api/v1/beds?status=available`

Bed mutation endpoints must use transactions.

### Laboratory

- `GET /api/v1/laboratory/tests`
- `POST /api/v1/laboratory/tests`
- `PATCH /api/v1/laboratory/tests/:testId`
- `GET /api/v1/laboratory/orders`
- `POST /api/v1/laboratory/orders`
- `GET /api/v1/laboratory/orders/:orderId`
- `POST /api/v1/laboratory/orders/:orderId/collect`
- `PATCH /api/v1/laboratory/orders/:orderId/items/:itemId/result`
- `POST /api/v1/laboratory/orders/:orderId/complete`

### Pharmacy

- `GET /api/v1/pharmacy/medicines`
- `POST /api/v1/pharmacy/medicines`
- `PATCH /api/v1/pharmacy/medicines/:medicineId`
- `GET /api/v1/pharmacy/batches`
- `POST /api/v1/pharmacy/batches`
- `GET /api/v1/pharmacy/inventory-transactions`
- `GET /api/v1/pharmacy/prescriptions/pending`
- `POST /api/v1/pharmacy/prescriptions/:prescriptionId/dispense`

Dispense endpoint takes requested quantities, but server determines valid batches/prices and rejects insufficient stock.

### Billing

- `GET /api/v1/invoices`
- `POST /api/v1/invoices`
- `GET /api/v1/invoices/:invoiceId`
- `POST /api/v1/invoices/:invoiceId/items`
- `PATCH /api/v1/invoices/:invoiceId/items/:itemId`
- `DELETE /api/v1/invoices/:invoiceId/items/:itemId` only while allowed by invoice status
- `POST /api/v1/invoices/:invoiceId/issue`
- `POST /api/v1/invoices/:invoiceId/void`
- `POST /api/v1/invoices/:invoiceId/payments`
- `GET /api/v1/invoices/:invoiceId/payments`

Client never supplies `grandTotal`, `amountPaid`, or `balanceDue` as authoritative fields.

### Expenses

- `GET /api/v1/expenses`
- `POST /api/v1/expenses`
- `GET /api/v1/expenses/:expenseId`
- `PATCH /api/v1/expenses/:expenseId`

### Reports

- `GET /api/v1/reports/dashboard?from=&to=`
- `GET /api/v1/reports/appointments?from=&to=`
- `GET /api/v1/reports/revenue?from=&to=`
- `GET /api/v1/reports/payments?from=&to=`
- `GET /api/v1/reports/expenses?from=&to=`
- `GET /api/v1/reports/occupancy?from=&to=`
- `GET /api/v1/reports/pharmacy-stock`

Reports must query the database. Charts must never be backed by random arrays in UI.

### Admin

- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `GET /api/v1/admin/users/:userId`
- `PATCH /api/v1/admin/users/:userId`
- `PUT /api/v1/admin/users/:userId/roles`
- `GET /api/v1/admin/roles`
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/settings`
- `PATCH /api/v1/admin/settings`

## HTTP Status Guidelines

- 200: successful read/update/action.
- 201: created.
- 204: successful no-content operation where appropriate.
- 400: malformed request/business input.
- 401: unauthenticated.
- 403: authenticated but unauthorized.
- 404: resource missing/inaccessible.
- 409: state/concurrency conflict, duplicate booking, occupied bed, insufficient stock conflict where appropriate.
- 422: validation semantics if the project standardizes on it; choose either 400 or 422 consistently for Zod failures.
- 500: unexpected server error.

## Idempotency

For payment creation and other operations vulnerable to retries/double submission, support an idempotency key or stable external transaction reference where appropriate. UI must disable duplicate submission while pending, but server-side protection is still required.
