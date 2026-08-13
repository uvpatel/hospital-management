import { pgTable, uuid, varchar, timestamp, boolean, numeric, integer, text, time, index } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { departments } from './organization';
import { patients } from './patients';
import { appointmentStatusEnum, encounterStatusEnum, prescriptionStatusEnum } from './common';

export const doctors = pgTable('doctors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique(),
  departmentId: uuid('department_id').references(() => departments.id).notNull(),
  doctorCode: varchar('doctor_code', { length: 50 }).notNull().unique(),
  registrationNumber: varchar('registration_number', { length: 100 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  specialization: varchar('specialization', { length: 255 }).notNull(),
  qualification: varchar('qualification', { length: 255 }),
  consultationFee: numeric('consultation_fee', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const doctorSchedules = pgTable('doctor_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  doctorId: uuid('doctor_id').references(() => doctors.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Sun, 6=Sat
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  slotDurationMinutes: integer('slot_duration_minutes').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentNumber: varchar('appointment_number', { length: 50 }).notNull().unique(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  doctorId: uuid('doctor_id').references(() => doctors.id).notNull(),
  scheduledStart: timestamp('scheduled_start', { withTimezone: true }).notNull(),
  scheduledEnd: timestamp('scheduled_end', { withTimezone: true }).notNull(),
  status: appointmentStatusEnum('status').default('scheduled').notNull(),
  reason: varchar('reason', { length: 255 }),
  notes: text('notes'),
  bookedBy: uuid('booked_by').references(() => users.id).notNull(),
  cancellationReason: text('cancellation_reason'),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('appointment_doctor_start_idx').on(t.doctorId, t.scheduledStart),
  index('appointment_patient_start_idx').on(t.patientId, t.scheduledStart),
  index('appointment_status_start_idx').on(t.status, t.scheduledStart),
]);

export const encounters = pgTable('encounters', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  doctorId: uuid('doctor_id').references(() => doctors.id).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id).unique(),
  encounterNumber: varchar('encounter_number', { length: 50 }).notNull().unique(),
  status: encounterStatusEnum('status').default('in_progress').notNull(),
  chiefComplaint: text('chief_complaint').notNull(),
  history: text('history'),
  examinationNotes: text('examination_notes'),
  diagnosisSummary: text('diagnosis_summary'),
  treatmentPlan: text('treatment_plan'),
  followUpAt: timestamp('follow_up_at', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const diagnoses = pgTable('diagnoses', {
  id: uuid('id').primaryKey().defaultRandom(),
  encounterId: uuid('encounter_id').references(() => encounters.id).notNull(),
  code: varchar('code', { length: 50 }),
  description: text('description').notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  prescriptionNumber: varchar('prescription_number', { length: 50 }).notNull().unique(),
  encounterId: uuid('encounter_id').references(() => encounters.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  doctorId: uuid('doctor_id').references(() => doctors.id).notNull(),
  status: prescriptionStatusEnum('status').default('active').notNull(),
  notes: text('notes'),
  prescribedAt: timestamp('prescribed_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const prescriptionItems = pgTable('prescription_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  prescriptionId: uuid('prescription_id').references(() => prescriptions.id).notNull(),
  medicineId: uuid('medicine_id'), // nullable, can be from catalog or free text
  medicineNameSnapshot: varchar('medicine_name_snapshot', { length: 255 }).notNull(),
  dosage: varchar('dosage', { length: 100 }).notNull(),
  route: varchar('route', { length: 100 }),
  frequency: varchar('frequency', { length: 100 }).notNull(),
  duration: varchar('duration', { length: 100 }).notNull(),
  quantity: integer('quantity'),
  instructions: text('instructions'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
