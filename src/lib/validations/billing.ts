import { z } from 'zod';

export const paymentMethodSchema = z.enum(['cash', 'card', 'bank_transfer', 'insurance', 'other']);

export const createChargeCatalogItemSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  name: z.string().min(1, 'Name is required').max(255),
  category: z.string().min(1, 'Category is required').max(100),
  defaultAmount: z.coerce.number().min(0, 'Default amount must be >= 0'),
});

export const createInvoiceSchema = z.object({
  patientId: z.string().uuid('Valid patient ID required'),
  encounterId: z.string().uuid().optional(),
  admissionId: z.string().uuid().optional(),
  dueAt: z.string().optional(),
  items: z.array(
    z.object({
      descriptionSnapshot: z.string().min(1, 'Description is required').max(255),
      quantity: z.coerce.number().positive(),
      unitPrice: z.coerce.number().min(0),
      discountAmount: z.coerce.number().min(0).default(0),
      taxAmount: z.coerce.number().min(0).default(0),
    })
  ).min(1, 'Invoice must contain at least one line item'),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.coerce.number().positive('Payment amount must be positive'),
  paymentMethod: paymentMethodSchema,
  transactionReference: z.string().max(255).optional(),
  note: z.string().max(500).optional(),
});

export const createExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.coerce.number().positive('Expense amount must be positive'),
  expenseDate: z.string().datetime(),
  paymentMethod: z.string().max(50).optional(),
  vendorName: z.string().max(255).optional(),
  referenceNumber: z.string().max(255).optional(),
});

export type CreateChargeCatalogItemInput = z.infer<typeof createChargeCatalogItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
