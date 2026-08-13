# Business Workflows

## Roles

Initial roles:
- ADMIN
- RECEPTIONIST
- DOCTOR
- NURSE
- LAB_TECHNICIAN
- PHARMACIST
- CASHIER
- ACCOUNTANT

Permissions, not role-name conditionals, are authoritative. Roles are collections of permissions.

## Patient Registration

1. Search by patient number, phone, and name before creating a new patient.
2. Validate required identity/contact fields.
3. Server generates `patient_number`.
4. Create patient.
5. Write audit event.
6. Redirect to patient detail.

Prevent duplicate patient number via DB unique constraint. Duplicate-person detection may warn, but must not incorrectly block distinct people without explicit policy.

## Appointment Booking

1. Select patient.
2. Select department/doctor.
3. Select date.
4. Fetch server-generated available slots.
5. Select slot and reason.
6. On submit, server rechecks schedule and slot conflict.
7. Create appointment and server-generated appointment number.
8. Audit booking.

Never rely only on the availability result viewed seconds earlier; revalidate at commit time.

## Appointment Check-In and Consultation

1. Receptionist checks in scheduled appointment.
2. Doctor sees checked-in queue.
3. Doctor starts appointment; service creates or starts encounter.
4. Doctor records clinical data.
5. Diagnoses and prescriptions may be added.
6. Lab orders may be created.
7. Doctor completes encounter.
8. Billing service adds eligible charges.

## Prescription

- Prescription belongs to encounter, patient, doctor.
- Item keeps medicine snapshot information.
- Once finalized/dispensing starts, edits are restricted.
- Pharmacy cannot dispense more than stock or prescribed quantity.

## Admission

1. Select patient and attending doctor.
2. Enter reason and admission time.
3. Choose an available bed.
4. Transaction creates admission + bed allocation and marks bed occupied.
5. If bed becomes unavailable concurrently, return conflict and ask user to choose again.

## Bed Transfer

Single transaction:
1. Confirm admission active.
2. Confirm target bed available.
3. End current allocation.
4. Mark previous bed available.
5. Create target allocation.
6. Mark target bed occupied.
7. Audit transfer.

## Discharge

Single workflow/transaction where practical:
1. Validate active admission.
2. Validate required clinical discharge information.
3. Close active bed allocation.
4. Mark bed available.
5. Set admission discharged timestamp/status.
6. Apply/finalize remaining room/service charges.
7. Save discharge summary.
8. Audit discharge.

## Lab

- Doctor orders one or more tests.
- Order item snapshots catalog test name/price/reference data.
- Technician collects/receives sample.
- Technician results each test item.
- Completion requires required items to have valid result state.
- Result changes after completion require controlled amendment/audit policy.

## Pharmacy Receiving

1. Create medicine if absent.
2. Add batch with batch number, expiry, quantity, purchase and sale price.
3. Create positive inventory transaction.
4. Batch quantity and transaction record must agree.

## Pharmacy Dispensing

1. Load prescription and pending quantities.
2. Select eligible non-expired stock, preferably FEFO (first-expiry-first-out).
3. Recheck stock inside transaction.
4. Create dispensation/items.
5. Reduce batch quantities.
6. Add negative inventory transactions.
7. Update prescription status.
8. Add billable pharmacy charges if configured.

Never allow negative `quantity_available`.

## Invoice

- Draft can accept allowed line changes.
- Issue locks controlled fields according to billing rules.
- Invoice total = server sum of line totals and adjustments.
- Payments cannot silently exceed permitted balance; define overpayment policy explicitly.
- Payment creation recomputes `amount_paid`, `balance_due`, and status transactionally.
- Voiding requires permission, reason, and audit event.

## Expenses

Accountant/cashier permissions determine create/edit visibility. Expense amount/date/category are validated server-side. Reports aggregate persisted expenses; no UI-only calculations as source of truth.

## Audit Events

At minimum audit:
- Login/security-sensitive account changes.
- Patient create/update on sensitive fields.
- Appointment create/cancel/status actions.
- Encounter completion.
- Prescription finalization.
- Admission/transfer/discharge.
- Lab result completion/amendment.
- Dispensing/inventory adjustments.
- Invoice issue/void.
- Payment create/reversal.
- Role/permission/user changes.
