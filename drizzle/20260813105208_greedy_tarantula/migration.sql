CREATE TYPE "admission_status" AS ENUM('admitted', 'discharged', 'cancelled');--> statement-breakpoint
CREATE TYPE "appointment_status" AS ENUM('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "bed_status" AS ENUM('available', 'occupied', 'maintenance');--> statement-breakpoint
CREATE TYPE "blood_group" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');--> statement-breakpoint
CREATE TYPE "document_type" AS ENUM('id_proof', 'lab_report', 'prescription', 'other');--> statement-breakpoint
CREATE TYPE "encounter_status" AS ENUM('in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "inventory_transaction_type" AS ENUM('receive', 'dispense', 'adjustment', 'return');--> statement-breakpoint
CREATE TYPE "invoice_status" AS ENUM('draft', 'issued', 'partially_paid', 'paid', 'void');--> statement-breakpoint
CREATE TYPE "lab_order_status" AS ENUM('ordered', 'collected', 'processing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('cash', 'card', 'bank_transfer', 'insurance', 'other');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "prescription_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "user_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(100) NOT NULL UNIQUE,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_unique" UNIQUE("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(50) NOT NULL UNIQUE,
	"name" varchar(100) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_unique" UNIQUE("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar(255) NOT NULL UNIQUE,
	"password_hash" varchar(255),
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone" varchar(50),
	"status" "user_status" DEFAULT 'active'::"user_status" NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(50) NOT NULL UNIQUE,
	"name" varchar(100) NOT NULL UNIQUE,
	"description" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hospital_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"hospital_name" varchar(255) NOT NULL,
	"registration_number" varchar(100),
	"phone" varchar(50),
	"email" varchar(255),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(100),
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"currency_code" varchar(10) DEFAULT 'USD' NOT NULL,
	"invoice_prefix" varchar(10) DEFAULT 'INV-',
	"patient_prefix" varchar(10) DEFAULT 'PT-',
	"appointment_prefix" varchar(10) DEFAULT 'APT-',
	"admission_prefix" varchar(10) DEFAULT 'ADM-',
	"lab_order_prefix" varchar(10) DEFAULT 'LAB-',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"storage_key" varchar(500) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_number" varchar(50) NOT NULL UNIQUE,
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"date_of_birth" date NOT NULL,
	"gender" "gender" NOT NULL,
	"blood_group" "blood_group",
	"phone" varchar(50) NOT NULL,
	"alternate_phone" varchar(50),
	"email" varchar(255),
	"address_line1" varchar(255) NOT NULL,
	"address_line2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"country" varchar(100) NOT NULL,
	"emergency_contact_name" varchar(100) NOT NULL,
	"emergency_contact_relationship" varchar(100) NOT NULL,
	"emergency_contact_phone" varchar(50) NOT NULL,
	"allergies" text,
	"medical_alerts" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"appointment_number" varchar(50) NOT NULL UNIQUE,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"scheduled_start" timestamp with time zone NOT NULL,
	"scheduled_end" timestamp with time zone NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled'::"appointment_status" NOT NULL,
	"reason" varchar(255),
	"notes" text,
	"booked_by" uuid NOT NULL,
	"cancellation_reason" text,
	"checked_in_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagnoses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"encounter_id" uuid NOT NULL,
	"code" varchar(50),
	"description" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"doctor_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"slot_duration_minutes" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid UNIQUE,
	"department_id" uuid NOT NULL,
	"doctor_code" varchar(50) NOT NULL UNIQUE,
	"registration_number" varchar(100) NOT NULL UNIQUE,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"specialization" varchar(255) NOT NULL,
	"qualification" varchar(255),
	"consultation_fee" numeric(10,2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"appointment_id" uuid UNIQUE,
	"encounter_number" varchar(50) NOT NULL UNIQUE,
	"status" "encounter_status" DEFAULT 'in_progress'::"encounter_status" NOT NULL,
	"chief_complaint" text NOT NULL,
	"history" text,
	"examination_notes" text,
	"diagnosis_summary" text,
	"treatment_plan" text,
	"follow_up_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescription_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"prescription_id" uuid NOT NULL,
	"medicine_id" uuid,
	"medicine_name_snapshot" varchar(255) NOT NULL,
	"dosage" varchar(100) NOT NULL,
	"route" varchar(100),
	"frequency" varchar(100) NOT NULL,
	"duration" varchar(100) NOT NULL,
	"quantity" integer,
	"instructions" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"prescription_number" varchar(50) NOT NULL UNIQUE,
	"encounter_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"status" "prescription_status" DEFAULT 'active'::"prescription_status" NOT NULL,
	"notes" text,
	"prescribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"admission_number" varchar(50) NOT NULL UNIQUE,
	"patient_id" uuid NOT NULL,
	"attending_doctor_id" uuid NOT NULL,
	"status" "admission_status" DEFAULT 'admitted'::"admission_status" NOT NULL,
	"admission_reason" varchar(500) NOT NULL,
	"admitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expected_discharge_at" timestamp with time zone,
	"discharged_at" timestamp with time zone,
	"discharge_summary" varchar(2000),
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bed_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"admission_id" uuid NOT NULL,
	"bed_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"allocated_by" uuid NOT NULL,
	"ended_by" uuid,
	"transfer_reason" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "beds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"room_id" uuid NOT NULL,
	"bed_number" varchar(50) NOT NULL,
	"status" "bed_status" DEFAULT 'available'::"bed_status" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "beds_room_id_bed_number_unique" UNIQUE("room_id","bed_number")
);
--> statement-breakpoint
CREATE TABLE "clinical_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"admission_id" uuid NOT NULL,
	"author_user_id" uuid NOT NULL,
	"note_type" varchar(50) NOT NULL,
	"note_text" varchar(5000) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ward_id" uuid NOT NULL,
	"room_number" varchar(50) NOT NULL,
	"room_type" varchar(50) NOT NULL,
	"daily_rate" numeric(10,2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "rooms_ward_id_room_number_unique" UNIQUE("ward_id","room_number")
);
--> statement-breakpoint
CREATE TABLE "wards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(50) NOT NULL UNIQUE,
	"name" varchar(100) NOT NULL UNIQUE,
	"type" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lab_order_id" uuid NOT NULL,
	"lab_test_id" uuid NOT NULL,
	"test_name_snapshot" varchar(255) NOT NULL,
	"price_snapshot" numeric(10,2) NOT NULL,
	"status" "lab_order_status" DEFAULT 'ordered'::"lab_order_status" NOT NULL,
	"result_value" varchar(255),
	"result_text" varchar(2000),
	"reference_range_snapshot" varchar(255),
	"unit_snapshot" varchar(50),
	"resulted_by_user_id" uuid,
	"resulted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lab_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lab_order_number" varchar(50) NOT NULL UNIQUE,
	"patient_id" uuid NOT NULL,
	"encounter_id" uuid,
	"admission_id" uuid,
	"ordered_by_doctor_id" uuid NOT NULL,
	"status" "lab_order_status" DEFAULT 'ordered'::"lab_order_status" NOT NULL,
	"ordered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"collected_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(50) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"sample_type" varchar(100),
	"price" numeric(10,2) NOT NULL,
	"reference_range" varchar(255),
	"unit" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispensation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"dispensation_id" uuid NOT NULL,
	"prescription_item_id" uuid NOT NULL,
	"medicine_id" uuid NOT NULL,
	"batch_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_snapshot" numeric(10,2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispensations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"prescription_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"dispensed_by" uuid NOT NULL,
	"dispensed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"medicine_id" uuid NOT NULL,
	"batch_id" uuid,
	"transaction_type" "inventory_transaction_type" NOT NULL,
	"quantity_delta" integer NOT NULL,
	"reference_type" varchar(100) NOT NULL,
	"reference_id" uuid,
	"note" varchar(500),
	"performed_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicine_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"medicine_id" uuid NOT NULL,
	"batch_number" varchar(100) NOT NULL,
	"expiry_date" timestamp with time zone NOT NULL,
	"purchase_price" numeric(10,2) NOT NULL,
	"sale_price" numeric(10,2) NOT NULL,
	"quantity_received" integer NOT NULL,
	"quantity_available" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medicine_batches_medicine_id_batch_number_unique" UNIQUE("medicine_id","batch_number")
);
--> statement-breakpoint
CREATE TABLE "medicines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(50) NOT NULL UNIQUE,
	"generic_name" varchar(255) NOT NULL,
	"brand_name" varchar(255),
	"dosage_form" varchar(100) NOT NULL,
	"strength" varchar(100) NOT NULL,
	"manufacturer" varchar(255),
	"reorder_level" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charge_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(50) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"default_amount" numeric(10,2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"expense_number" varchar(50) NOT NULL UNIQUE,
	"category" varchar(100) NOT NULL,
	"description" varchar(500) NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"expense_date" timestamp with time zone NOT NULL,
	"payment_method" varchar(50),
	"vendor_name" varchar(255),
	"reference_number" varchar(255),
	"recorded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"invoice_id" uuid NOT NULL,
	"source_type" varchar(50),
	"source_id" uuid,
	"description_snapshot" varchar(255) NOT NULL,
	"quantity" numeric(10,2) NOT NULL,
	"unit_price" numeric(12,2) NOT NULL,
	"discount_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"line_total" numeric(12,2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"invoice_number" varchar(50) NOT NULL UNIQUE,
	"patient_id" uuid NOT NULL,
	"encounter_id" uuid,
	"admission_id" uuid,
	"status" "invoice_status" DEFAULT 'draft'::"invoice_status" NOT NULL,
	"currency_code" varchar(10) DEFAULT 'USD' NOT NULL,
	"subtotal" numeric(12,2) DEFAULT '0' NOT NULL,
	"discount_total" numeric(12,2) DEFAULT '0' NOT NULL,
	"tax_total" numeric(12,2) DEFAULT '0' NOT NULL,
	"grand_total" numeric(12,2) DEFAULT '0' NOT NULL,
	"amount_paid" numeric(12,2) DEFAULT '0' NOT NULL,
	"balance_due" numeric(12,2) DEFAULT '0' NOT NULL,
	"issued_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"payment_number" varchar(50) NOT NULL UNIQUE,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'completed'::"payment_status" NOT NULL,
	"transaction_reference" varchar(255),
	"received_by" uuid NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"actor_user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid,
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" varchar(1000),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "patient_phone_idx" ON "patients" ("phone");--> statement-breakpoint
CREATE INDEX "patient_created_at_idx" ON "patients" ("created_at");--> statement-breakpoint
CREATE INDEX "appointment_doctor_start_idx" ON "appointments" ("doctor_id","scheduled_start");--> statement-breakpoint
CREATE INDEX "appointment_patient_start_idx" ON "appointments" ("patient_id","scheduled_start");--> statement-breakpoint
CREATE INDEX "appointment_status_start_idx" ON "appointments" ("status","scheduled_start");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_logs" ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_logs" ("action");--> statement-breakpoint
CREATE INDEX "audit_created_at_idx" ON "audit_logs" ("created_at");--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id");--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id");--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id");--> statement-breakpoint
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id");--> statement-breakpoint
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_uploaded_by_users_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_booked_by_users_id_fkey" FOREIGN KEY ("booked_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_encounter_id_encounters_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id");--> statement-breakpoint
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_doctor_id_doctors_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id");--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_department_id_departments_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id");--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id");--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_doctor_id_doctors_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id");--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_appointment_id_appointments_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id");--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id");--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_encounter_id_encounters_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id");--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id");--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_doctors_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id");--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id");--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_attending_doctor_id_doctors_id_fkey" FOREIGN KEY ("attending_doctor_id") REFERENCES "doctors"("id");--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "bed_allocations" ADD CONSTRAINT "bed_allocations_admission_id_admissions_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id");--> statement-breakpoint
ALTER TABLE "bed_allocations" ADD CONSTRAINT "bed_allocations_bed_id_beds_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id");--> statement-breakpoint
ALTER TABLE "bed_allocations" ADD CONSTRAINT "bed_allocations_allocated_by_users_id_fkey" FOREIGN KEY ("allocated_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "bed_allocations" ADD CONSTRAINT "bed_allocations_ended_by_users_id_fkey" FOREIGN KEY ("ended_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id");--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_admission_id_admissions_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id");--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_author_user_id_users_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_ward_id_wards_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id");--> statement-breakpoint
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_lab_order_id_lab_orders_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id");--> statement-breakpoint
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_lab_test_id_lab_tests_id_fkey" FOREIGN KEY ("lab_test_id") REFERENCES "lab_tests"("id");--> statement-breakpoint
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_resulted_by_user_id_users_id_fkey" FOREIGN KEY ("resulted_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id");--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_encounter_id_encounters_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id");--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_admission_id_admissions_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id");--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_ordered_by_doctor_id_doctors_id_fkey" FOREIGN KEY ("ordered_by_doctor_id") REFERENCES "doctors"("id");--> statement-breakpoint
ALTER TABLE "dispensation_items" ADD CONSTRAINT "dispensation_items_dispensation_id_dispensations_id_fkey" FOREIGN KEY ("dispensation_id") REFERENCES "dispensations"("id");--> statement-breakpoint
ALTER TABLE "dispensation_items" ADD CONSTRAINT "dispensation_items_nKNaimWiE3EV_fkey" FOREIGN KEY ("prescription_item_id") REFERENCES "prescription_items"("id");--> statement-breakpoint
ALTER TABLE "dispensation_items" ADD CONSTRAINT "dispensation_items_medicine_id_medicines_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id");--> statement-breakpoint
ALTER TABLE "dispensation_items" ADD CONSTRAINT "dispensation_items_batch_id_medicine_batches_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "medicine_batches"("id");--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_prescription_id_prescriptions_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id");--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id");--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_dispensed_by_users_id_fkey" FOREIGN KEY ("dispensed_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_medicine_id_medicines_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id");--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_batch_id_medicine_batches_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "medicine_batches"("id");--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_performed_by_users_id_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "medicine_batches" ADD CONSTRAINT "medicine_batches_medicine_id_medicines_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id");--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recorded_by_users_id_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_encounter_id_encounters_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_admission_id_admissions_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_received_by_users_id_fkey" FOREIGN KEY ("received_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id");