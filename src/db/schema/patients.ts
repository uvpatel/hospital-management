import { pgTable, uuid, varchar, timestamp, date, text, boolean, integer, index } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { genderEnum, bloodGroupEnum, documentTypeEnum } from './common';

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientNumber: varchar('patient_number', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  middleName: varchar('middle_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: genderEnum('gender').notNull(),
  bloodGroup: bloodGroupEnum('blood_group'),
  phone: varchar('phone', { length: 50 }).notNull(),
  alternatePhone: varchar('alternate_phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  addressLine1: varchar('address_line1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  emergencyContactName: varchar('emergency_contact_name', { length: 100 }).notNull(),
  emergencyContactRelationship: varchar('emergency_contact_relationship', { length: 100 }).notNull(),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 50 }).notNull(),
  allergies: text('allergies'),
  medicalAlerts: text('medical_alerts'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('patient_phone_idx').on(t.phone),
  index('patient_created_at_idx').on(t.createdAt),
]);

export const patientDocuments = pgTable('patient_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  documentType: documentTypeEnum('document_type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  storageKey: varchar('storage_key', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
