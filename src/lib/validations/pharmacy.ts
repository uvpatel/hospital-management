import { z } from 'zod';

export const createMedicineSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  genericName: z.string().min(1, 'Generic name is required').max(255),
  brandName: z.string().max(255).optional(),
  dosageForm: z.string().min(1, 'Dosage form is required').max(100),
  strength: z.string().min(1, 'Strength is required').max(100),
  manufacturer: z.string().max(255).optional(),
  reorderLevel: z.coerce.number().int().min(0).default(10),
});

export const createMedicineBatchSchema = z.object({
  medicineId: z.string().uuid(),
  batchNumber: z.string().min(1, 'Batch number is required').max(100),
  expiryDate: z.string().datetime(),
  purchasePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  quantityReceived: z.coerce.number().int().positive(),
});

export const dispensePrescriptionSchema = z.object({
  prescriptionId: z.string().uuid(),
  items: z.array(
    z.object({
      prescriptionItemId: z.string().uuid(),
      medicineId: z.string().uuid(),
      batchId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'At least one item required to dispense'),
});

export type CreateMedicineInput = z.infer<typeof createMedicineSchema>;
export type CreateMedicineBatchInput = z.infer<typeof createMedicineBatchSchema>;
export type DispensePrescriptionInput = z.infer<typeof dispensePrescriptionSchema>;
