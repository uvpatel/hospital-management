import { pgTable, uuid, varchar, timestamp, boolean, numeric, unique } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { patients } from './patients';
import { doctors } from './clinical';
import { admissionStatusEnum, bedStatusEnum } from './common';

export const wards = pgTable('wards', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  wardId: uuid('ward_id').references(() => wards.id).notNull(),
  roomNumber: varchar('room_number', { length: 50 }).notNull(),
  roomType: varchar('room_type', { length: 50 }).notNull(),
  dailyRate: numeric('daily_rate', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
}, (t) => [
  unique().on(t.wardId, t.roomNumber)
]);

export const beds = pgTable('beds', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').references(() => rooms.id).notNull(),
  bedNumber: varchar('bed_number', { length: 50 }).notNull(),
  status: bedStatusEnum('status').default('available').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
}, (t) => [
  unique().on(t.roomId, t.bedNumber)
]);

export const admissions = pgTable('admissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  admissionNumber: varchar('admission_number', { length: 50 }).notNull().unique(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  attendingDoctorId: uuid('attending_doctor_id').references(() => doctors.id).notNull(),
  status: admissionStatusEnum('status').default('admitted').notNull(),
  admissionReason: varchar('admission_reason', { length: 500 }).notNull(),
  admittedAt: timestamp('admitted_at', { withTimezone: true }).defaultNow().notNull(),
  expectedDischargeAt: timestamp('expected_discharge_at', { withTimezone: true }),
  dischargedAt: timestamp('discharged_at', { withTimezone: true }),
  dischargeSummary: varchar('discharge_summary', { length: 2000 }),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const bedAllocations = pgTable('bed_allocations', {
  id: uuid('id').primaryKey().defaultRandom(),
  admissionId: uuid('admission_id').references(() => admissions.id).notNull(),
  bedId: uuid('bed_id').references(() => beds.id).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  allocatedBy: uuid('allocated_by').references(() => users.id).notNull(),
  endedBy: uuid('ended_by').references(() => users.id),
  transferReason: varchar('transfer_reason', { length: 500 }),
});

export const clinicalNotes = pgTable('clinical_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  admissionId: uuid('admission_id').references(() => admissions.id).notNull(),
  authorUserId: uuid('author_user_id').references(() => users.id).notNull(),
  noteType: varchar('note_type', { length: 50 }).notNull(),
  noteText: varchar('note_text', { length: 5000 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
