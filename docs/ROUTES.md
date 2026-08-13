# Application Routes

## Authentication

```text
/login
```

## Dashboard

```text
/dashboard
```

Shows database-backed KPIs appropriate to current user's permissions.

## Patients

```text
/patients
/patients/new
/patients/[patientId]
/patients/[patientId]/edit
/patients/[patientId]/appointments
/patients/[patientId]/encounters
/patients/[patientId]/admissions
/patients/[patientId]/laboratory
/patients/[patientId]/prescriptions
/patients/[patientId]/billing
/patients/[patientId]/documents
```

Prefer tabs/sub-navigation inside patient detail when this improves UX; the URLs remain addressable.

## Doctors and Departments

```text
/departments
/departments/new
/departments/[departmentId]/edit
/doctors
/doctors/new
/doctors/[doctorId]
/doctors/[doctorId]/edit
/doctors/[doctorId]/schedule
```

## Appointments

```text
/appointments
/appointments/calendar
/appointments/new
/appointments/[appointmentId]
/appointments/[appointmentId]/edit
```

## Encounters / OPD

```text
/encounters
/encounters/[encounterId]
/encounters/[encounterId]/consultation
```

The consultation screen should contain patient context, encounter notes, diagnoses, prescriptions, lab ordering, and completion actions as permissions allow.

## Inpatient / IPD

```text
/admissions
/admissions/new
/admissions/[admissionId]
/admissions/[admissionId]/bed
/admissions/[admissionId]/notes
/admissions/[admissionId]/billing
/admissions/[admissionId]/discharge
/wards
/rooms
/beds
```

## Laboratory

```text
/laboratory
/laboratory/orders
/laboratory/orders/[orderId]
/laboratory/tests
/laboratory/tests/new
/laboratory/tests/[testId]/edit
```

## Pharmacy

```text
/pharmacy
/pharmacy/medicines
/pharmacy/medicines/new
/pharmacy/medicines/[medicineId]/edit
/pharmacy/batches
/pharmacy/inventory
/pharmacy/dispensing
/pharmacy/dispensing/[prescriptionId]
```

## Billing

```text
/billing
/billing/invoices
/billing/invoices/new
/billing/invoices/[invoiceId]
/billing/payments
/expenses
/expenses/new
/expenses/[expenseId]/edit
```

## Reports

```text
/reports
/reports/appointments
/reports/revenue
/reports/payments
/reports/expenses
/reports/occupancy
/reports/pharmacy-stock
```

## Admin

```text
/admin/users
/admin/users/new
/admin/users/[userId]
/admin/roles
/admin/audit-logs
/admin/settings
```

## Navigation Visibility

Sidebar items are filtered by permission for usability. This is not authorization. Server-side route/data/action permission checks remain mandatory.

## Routing Conventions

- Use kebab-case URL segments.
- Use explicit dynamic param names.
- Use `loading.tsx` for expensive route segments.
- Use `error.tsx` at suitable boundaries.
- Use `notFound()` for missing resources.
- Do not use query parameters as a substitute for resource identity.
- Use query parameters for filters, pagination, sort, date ranges, and tab state when shareable URLs are useful.
