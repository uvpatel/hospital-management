# Database Design

## Database Rules

- PostgreSQL is authoritative.
- Drizzle schema is split by domain under `db/schema/`.
- Every foreign key used in frequent joins/filtering must be evaluated for an index.
- Use `created_at` and `updated_at` consistently.
- Use `created_by` / `updated_by` where auditability requires actor attribution.
- Prefer archival/status fields over deleting operational/clinical/financial records.
- Enforce invariant rules at both application and database level when possible.
- Use unique constraints for business identifiers.

## Schema Files

### `common.ts`

Shared PostgreSQL enums/helpers/types only. Keep it small.

Suggested enums:
- gender
- blood_group
- user_status
- appointment_status
- encounter_status
- admission_status
- bed_status
- lab_order_status
- prescription_status
- invoice_status
- payment_status
- payment_method
- inventory_transaction_type
- document_type

### `auth.ts`

#### users
- id UUID PK
- email unique not null
- password_hash nullable depending on auth provider
- first_name
- last_name
- phone
- status
- last_login_at
- created_at
- updated_at

#### roles
- id UUID PK
- code unique
- name
- description

#### permissions
- id UUID PK
- code unique
- description

#### user_roles
- user_id FK
- role_id FK
- composite unique/PK

#### role_permissions
- role_id FK
- permission_id FK
- composite unique/PK

#### sessions
Shape depends on selected auth library; store only what the provider requires.

### `organization.ts`

#### hospital_settings
- id UUID PK
- hospital_name
- registration_number
- phone
- email
- address fields
- timezone
- currency_code
- invoice_prefix
- patient_prefix
- appointment_prefix
- admission_prefix
- lab_order_prefix
- created_at
- updated_at

For a single-hospital MVP this can contain one active row. If converting to multi-tenant SaaS, introduce `organization_id` deliberately across tenant-owned tables instead of ad hoc changes.

#### departments
- id UUID PK
- code unique
- name unique
- description
- is_active
- created_at
- updated_at

### `patients.ts`

#### patients
- id UUID PK
- patient_number unique not null
- first_name
- middle_name nullable
- last_name
- date_of_birth
- gender
- blood_group nullable
- phone
- alternate_phone nullable
- email nullable
- address_line1
- address_line2 nullable
- city
- state
- postal_code
- country
- emergency_contact_name
- emergency_contact_relationship
- emergency_contact_phone
- allergies nullable text (MVP; normalize later if needed)
- medical_alerts nullable text
- is_active
- created_at
- updated_at

Indexes:
- patient_number unique
- phone
- normalized/searchable name strategy
- created_at

#### patient_documents
- id UUID PK
- patient_id FK
- document_type
- title
- storage_key/url metadata
- mime_type
- size_bytes
- uploaded_by FK user
- created_at

Do not store binary files in PostgreSQL unless explicitly required.

### `clinical.ts`

#### doctors
- id UUID PK
- user_id FK nullable/unique if doctor has login
- department_id FK
- doctor_code unique
- registration_number unique
- first_name
- last_name
- phone
- email
- specialization
- qualification nullable
- consultation_fee numeric
- is_active
- created_at
- updated_at

#### doctor_schedules
- id UUID PK
- doctor_id FK
- day_of_week
- start_time
- end_time
- slot_duration_minutes
- is_active
- created_at
- updated_at

Add constraint preventing impossible time range. Overlap validation occurs in service layer; add DB exclusion constraint later if implementation supports it reliably.

#### appointments
- id UUID PK
- appointment_number unique
- patient_id FK
- doctor_id FK
- scheduled_start timestamptz
- scheduled_end timestamptz
- status
- reason nullable
- notes nullable
- booked_by FK user
- cancellation_reason nullable
- checked_in_at nullable
- started_at nullable
- completed_at nullable
- created_at
- updated_at

Indexes:
- doctor_id + scheduled_start
- patient_id + scheduled_start
- status + scheduled_start

#### encounters
- id UUID PK
- patient_id FK
- doctor_id FK
- appointment_id FK nullable unique when one encounter per appointment
- encounter_number unique
- status
- chief_complaint
- history nullable
- examination_notes nullable
- diagnosis_summary nullable
- treatment_plan nullable
- follow_up_at nullable
- started_at
- completed_at nullable
- created_at
- updated_at

#### diagnoses
- id UUID PK
- encounter_id FK
- code nullable
- description
- is_primary
- created_at

#### prescriptions
- id UUID PK
- prescription_number unique
- encounter_id FK
- patient_id FK
- doctor_id FK
- status
- notes nullable
- prescribed_at
- created_at
- updated_at

#### prescription_items
- id UUID PK
- prescription_id FK
- medicine_id FK nullable if free-text medicine is allowed; prefer catalog FK
- medicine_name_snapshot
- dosage
- route nullable
- frequency
- duration
- quantity nullable
- instructions nullable
- created_at

Use snapshot text for medically important historical display even if medicine catalog name later changes.

### `inpatient.ts`

#### wards
- id UUID PK
- code unique
- name unique
- type
- is_active

#### rooms
- id UUID PK
- ward_id FK
- room_number
- room_type
- daily_rate numeric
- is_active
- unique ward_id + room_number

#### beds
- id UUID PK
- room_id FK
- bed_number
- status
- is_active
- unique room_id + bed_number

#### admissions
- id UUID PK
- admission_number unique
- patient_id FK
- attending_doctor_id FK
- status
- admission_reason
- admitted_at
- expected_discharge_at nullable
- discharged_at nullable
- discharge_summary nullable
- created_by FK user
- created_at
- updated_at

#### bed_allocations
- id UUID PK
- admission_id FK
- bed_id FK
- started_at
- ended_at nullable
- allocated_by FK user
- ended_by FK user nullable
- transfer_reason nullable

Rule: a bed cannot have more than one active allocation. Enforce via transaction plus database-supported unique partial index on active allocation (`ended_at IS NULL`).

#### clinical_notes
- id UUID PK
- admission_id FK
- author_user_id FK
- note_type
- note_text
- created_at

Do not allow ordinary update/delete of signed clinical notes; corrections should be appended where required.

### `laboratory.ts`

#### lab_tests
- id UUID PK
- code unique
- name
- description nullable
- sample_type nullable
- price numeric
- reference_range nullable
- unit nullable
- is_active

#### lab_orders
- id UUID PK
- lab_order_number unique
- patient_id FK
- encounter_id FK nullable
- admission_id FK nullable
- ordered_by_doctor_id FK
- status
- ordered_at
- collected_at nullable
- completed_at nullable
- created_at
- updated_at

#### lab_order_items
- id UUID PK
- lab_order_id FK
- lab_test_id FK
- test_name_snapshot
- price_snapshot numeric
- status
- result_value nullable
- result_text nullable
- reference_range_snapshot nullable
- unit_snapshot nullable
- resulted_by_user_id FK nullable
- resulted_at nullable

### `pharmacy.ts`

#### medicines
- id UUID PK
- code unique
- generic_name
- brand_name nullable
- dosage_form
- strength
- manufacturer nullable
- reorder_level integer
- is_active
- created_at
- updated_at

#### medicine_batches
- id UUID PK
- medicine_id FK
- batch_number
- expiry_date
- purchase_price numeric
- sale_price numeric
- quantity_received integer
- quantity_available integer
- created_at
- updated_at
- unique medicine_id + batch_number

Constraints:
- quantities >= 0
- prices >= 0

#### inventory_transactions
- id UUID PK
- medicine_id FK
- batch_id FK nullable
- transaction_type
- quantity_delta integer
- reference_type
- reference_id nullable UUID
- note nullable
- performed_by FK user
- created_at

Treat transaction history as immutable.

#### dispensations
- id UUID PK
- prescription_id FK
- patient_id FK
- dispensed_by FK user
- dispensed_at
- created_at

#### dispensation_items
- id UUID PK
- dispensation_id FK
- prescription_item_id FK
- medicine_id FK
- batch_id FK
- quantity integer
- unit_price_snapshot numeric

### `billing.ts`

#### charge_catalog
- id UUID PK
- code unique
- name
- category
- default_amount numeric
- is_active

#### invoices
- id UUID PK
- invoice_number unique
- patient_id FK
- encounter_id FK nullable
- admission_id FK nullable
- status
- currency_code
- subtotal numeric
- discount_total numeric
- tax_total numeric
- grand_total numeric
- amount_paid numeric
- balance_due numeric
- issued_at nullable
- due_at nullable
- created_by FK user
- created_at
- updated_at

All totals are server-generated and recomputed after item/payment changes.

#### invoice_items
- id UUID PK
- invoice_id FK
- source_type nullable
- source_id nullable UUID
- description_snapshot
- quantity numeric
- unit_price numeric
- discount_amount numeric
- tax_amount numeric
- line_total numeric
- created_at

#### payments
- id UUID PK
- payment_number unique
- invoice_id FK
- amount numeric
- payment_method
- status
- transaction_reference nullable
- received_by FK user
- received_at
- note nullable
- created_at

#### expenses
- id UUID PK
- expense_number unique
- category
- description
- amount numeric
- expense_date
- payment_method nullable
- vendor_name nullable
- reference_number nullable
- recorded_by FK user
- created_at
- updated_at

### `audit.ts`

#### audit_logs
- id UUID PK
- actor_user_id FK nullable
- action
- entity_type
- entity_id nullable UUID
- metadata JSONB with sanitized non-secret context
- ip_address nullable
- user_agent nullable
- created_at

Index actor, entity, action, and created_at as useful for investigations.

## Relations

Create explicit Drizzle relations in the appropriate domain schema modules. Export all tables and relation definitions from `db/schema/index.ts`.

## Query Result Shape

Do not return raw joined database rows directly to UI when they expose internal or ambiguous fields. Map to typed DTOs/views in query/service layer.
