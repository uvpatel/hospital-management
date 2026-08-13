import { z } from 'zod';

export const createWardSchema = z.object({
  code: z.string().min(1, 'Ward code is required').max(50),
  name: z.string().min(1, 'Ward name is required').max(100),
  type: z.string().min(1, 'Ward type is required').max(50),
});

export const createRoomSchema = z.object({
  wardId: z.string().uuid(),
  roomNumber: z.string().min(1, 'Room number is required').max(50),
  roomType: z.string().min(1, 'Room type is required').max(50),
  dailyRate: z.coerce.number().min(0, 'Daily rate must be >= 0'),
});

export const createBedSchema = z.object({
  roomId: z.string().uuid(),
  bedNumber: z.string().min(1, 'Bed number is required').max(50),
});

export const createAdmissionSchema = z.object({
  patientId: z.string().uuid(),
  attendingDoctorId: z.string().uuid(),
  admissionReason: z.string().min(1, 'Admission reason is required').max(500),
  bedId: z.string().uuid().optional(), // Initial bed allocation
});

export const allocateBedSchema = z.object({
  bedId: z.string().uuid(),
});

export const transferBedSchema = z.object({
  newBedId: z.string().uuid(),
  transferReason: z.string().max(500).optional(),
});

export const dischargeAdmissionSchema = z.object({
  dischargeSummary: z.string().min(1, 'Discharge summary is required').max(2000),
});

export const addClinicalNoteSchema = z.object({
  noteType: z.string().min(1, 'Note type is required').max(50),
  noteText: z.string().min(1, 'Note text is required').max(5000),
});

export type CreateWardInput = z.infer<typeof createWardSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type CreateBedInput = z.infer<typeof createBedSchema>;
export type CreateAdmissionInput = z.infer<typeof createAdmissionSchema>;
export type AllocateBedInput = z.infer<typeof allocateBedSchema>;
export type TransferBedInput = z.infer<typeof transferBedSchema>;
export type DischargeAdmissionInput = z.infer<typeof dischargeAdmissionSchema>;
export type AddClinicalNoteInput = z.infer<typeof addClinicalNoteSchema>;
