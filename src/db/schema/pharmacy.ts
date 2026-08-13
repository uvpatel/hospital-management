import { pgTable, uuid, varchar, timestamp, numeric, boolean, integer, unique } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { patients } from './patients';
import { prescriptions, prescriptionItems } from './clinical';
import { inventoryTransactionTypeEnum } from './common';

export const medicines = pgTable('medicines', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  genericName: varchar('generic_name', { length: 255 }).notNull(),
  brandName: varchar('brand_name', { length: 255 }),
  dosageForm: varchar('dosage_form', { length: 100 }).notNull(),
  strength: varchar('strength', { length: 100 }).notNull(),
  manufacturer: varchar('manufacturer', { length: 255 }),
  reorderLevel: integer('reorder_level').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const medicineBatches = pgTable('medicine_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  medicineId: uuid('medicine_id').references(() => medicines.id).notNull(),
  batchNumber: varchar('batch_number', { length: 100 }).notNull(),
  expiryDate: timestamp('expiry_date', { withTimezone: true }).notNull(),
  purchasePrice: numeric('purchase_price', { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }).notNull(),
  quantityReceived: integer('quantity_received').notNull(),
  quantityAvailable: integer('quantity_available').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique().on(t.medicineId, t.batchNumber)
]);

export const inventoryTransactions = pgTable('inventory_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  medicineId: uuid('medicine_id').references(() => medicines.id).notNull(),
  batchId: uuid('batch_id').references(() => medicineBatches.id),
  transactionType: inventoryTransactionTypeEnum('transaction_type').notNull(),
  quantityDelta: integer('quantity_delta').notNull(),
  referenceType: varchar('reference_type', { length: 100 }).notNull(),
  referenceId: uuid('reference_id'),
  note: varchar('note', { length: 500 }),
  performedBy: uuid('performed_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const dispensations = pgTable('dispensations', {
  id: uuid('id').primaryKey().defaultRandom(),
  prescriptionId: uuid('prescription_id').references(() => prescriptions.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  dispensedBy: uuid('dispensed_by').references(() => users.id).notNull(),
  dispensedAt: timestamp('dispensed_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const dispensationItems = pgTable('dispensation_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  dispensationId: uuid('dispensation_id').references(() => dispensations.id).notNull(),
  prescriptionItemId: uuid('prescription_item_id').references(() => prescriptionItems.id).notNull(),
  medicineId: uuid('medicine_id').references(() => medicines.id).notNull(),
  batchId: uuid('batch_id').references(() => medicineBatches.id).notNull(),
  quantity: integer('quantity').notNull(),
  unitPriceSnapshot: numeric('unit_price_snapshot', { precision: 10, scale: 2 }).notNull(),
});
