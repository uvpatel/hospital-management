import { pgTable, uuid, varchar, timestamp, numeric, boolean } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { patients } from './patients';
import { encounters, doctors } from './clinical';
import { admissions } from './inpatient';
import { labOrderStatusEnum } from './common';

export const labTests = pgTable('lab_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  sampleType: varchar('sample_type', { length: 100 }),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  referenceRange: varchar('reference_range', { length: 255 }),
  unit: varchar('unit', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
});

export const labOrders = pgTable('lab_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  labOrderNumber: varchar('lab_order_number', { length: 50 }).notNull().unique(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  encounterId: uuid('encounter_id').references(() => encounters.id),
  admissionId: uuid('admission_id').references(() => admissions.id),
  orderedByDoctorId: uuid('ordered_by_doctor_id').references(() => doctors.id).notNull(),
  status: labOrderStatusEnum('status').default('ordered').notNull(),
  orderedAt: timestamp('ordered_at', { withTimezone: true }).defaultNow().notNull(),
  collectedAt: timestamp('collected_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const labOrderItems = pgTable('lab_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  labOrderId: uuid('lab_order_id').references(() => labOrders.id).notNull(),
  labTestId: uuid('lab_test_id').references(() => labTests.id).notNull(),
  testNameSnapshot: varchar('test_name_snapshot', { length: 255 }).notNull(),
  priceSnapshot: numeric('price_snapshot', { precision: 10, scale: 2 }).notNull(),
  status: labOrderStatusEnum('status').default('ordered').notNull(),
  resultValue: varchar('result_value', { length: 255 }),
  resultText: varchar('result_text', { length: 2000 }),
  referenceRangeSnapshot: varchar('reference_range_snapshot', { length: 255 }),
  unitSnapshot: varchar('unit_snapshot', { length: 50 }),
  resultedByUserId: uuid('resulted_by_user_id').references(() => users.id),
  resultedAt: timestamp('resulted_at', { withTimezone: true }),
});
