import { z } from 'zod';

export const createEncounterSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  chiefComplaint: z.string().min(1, 'Chief complaint is required'),
  history: z.string().optional(),
  examinationNotes: z.string().optional(),
  treatmentPlan: z.string().optional(),
});

export const addDiagnosisSchema = z.object({
  code: z.string().optional(),
  description: z.string().min(1, 'Diagnosis description is required'),
  isPrimary: z.boolean().default(false),
});

export const addPrescriptionSchema = z.object({
  notes: z.string().optional(),
  items: z.array(
    z.object({
      medicineId: z.string().uuid().optional(),
      medicineNameSnapshot: z.string().min(1, 'Medicine name is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      route: z.string().optional(),
      frequency: z.string().min(1, 'Frequency is required'),
      duration: z.string().min(1, 'Duration is required'),
      quantity: z.number().int().positive().optional(),
      instructions: z.string().optional(),
    })
  ).min(1, 'At least one prescription item is required'),
});

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;
export type AddDiagnosisInput = z.infer<typeof addDiagnosisSchema>;
export type AddPrescriptionInput = z.infer<typeof addPrescriptionSchema>;
