import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const hospitalSettings = pgTable('hospital_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  hospitalName: varchar('hospital_name', { length: 255 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 100 }),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  addressLine1: varchar('address_line1', { length: 255 }),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
  currencyCode: varchar('currency_code', { length: 10 }).default('USD').notNull(),
  invoicePrefix: varchar('invoice_prefix', { length: 10 }).default('INV-'),
  patientPrefix: varchar('patient_prefix', { length: 10 }).default('PT-'),
  appointmentPrefix: varchar('appointment_prefix', { length: 10 }).default('APT-'),
  admissionPrefix: varchar('admission_prefix', { length: 10 }).default('ADM-'),
  labOrderPrefix: varchar('lab_order_prefix', { length: 10 }).default('LAB-'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: varchar('description', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
