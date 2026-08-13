import { pgTable, uuid, varchar, timestamp, numeric, boolean } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { patients } from './patients';
import { encounters } from './clinical';
import { admissions } from './inpatient';
import { invoiceStatusEnum, paymentStatusEnum, paymentMethodEnum } from './common';

export const chargeCatalog = pgTable('charge_catalog', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  defaultAmount: numeric('default_amount', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  encounterId: uuid('encounter_id').references(() => encounters.id),
  admissionId: uuid('admission_id').references(() => admissions.id),
  status: invoiceStatusEnum('status').default('draft').notNull(),
  currencyCode: varchar('currency_code', { length: 10 }).default('USD').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).default('0').notNull(),
  discountTotal: numeric('discount_total', { precision: 12, scale: 2 }).default('0').notNull(),
  taxTotal: numeric('tax_total', { precision: 12, scale: 2 }).default('0').notNull(),
  grandTotal: numeric('grand_total', { precision: 12, scale: 2 }).default('0').notNull(),
  amountPaid: numeric('amount_paid', { precision: 12, scale: 2 }).default('0').notNull(),
  balanceDue: numeric('balance_due', { precision: 12, scale: 2 }).default('0').notNull(),
  issuedAt: timestamp('issued_at', { withTimezone: true }),
  dueAt: timestamp('due_at', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').references(() => invoices.id).notNull(),
  sourceType: varchar('source_type', { length: 50 }),
  sourceId: uuid('source_id'),
  descriptionSnapshot: varchar('description_snapshot', { length: 255 }).notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  lineTotal: numeric('line_total', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  paymentNumber: varchar('payment_number', { length: 50 }).notNull().unique(),
  invoiceId: uuid('invoice_id').references(() => invoices.id).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  status: paymentStatusEnum('status').default('completed').notNull(),
  transactionReference: varchar('transaction_reference', { length: 255 }),
  receivedBy: uuid('received_by').references(() => users.id).notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
  note: varchar('note', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  expenseNumber: varchar('expense_number', { length: 50 }).notNull().unique(),
  category: varchar('category', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  expenseDate: timestamp('expense_date', { withTimezone: true }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  vendorName: varchar('vendor_name', { length: 255 }),
  referenceNumber: varchar('reference_number', { length: 255 }),
  recordedBy: uuid('recorded_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
