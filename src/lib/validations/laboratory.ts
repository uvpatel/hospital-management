import { z } from 'zod';

export const createLabTestSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  sampleType: z.string().max(100).optional(),
  price: z.coerce.number().min(0, 'Price must be >= 0'),
  referenceRange: z.string().max(255).optional(),
  unit: z.string().max(50).optional(),
});

export const createLabOrderSchema = z.object({
  patientId: z.string().uuid(),
  orderedByDoctorId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  admissionId: z.string().uuid().optional(),
  testIds: z.array(z.string().uuid()).min(1, 'Select at least one lab test'),
});

export const recordLabResultSchema = z.object({
  resultValue: z.string().min(1, 'Result value is required').max(255),
  resultText: z.string().max(2000).optional(),
});

export type CreateLabTestInput = z.infer<typeof createLabTestSchema>;
export type CreateLabOrderInput = z.infer<typeof createLabOrderSchema>;
export type RecordLabResultInput = z.infer<typeof recordLabResultSchema>;
