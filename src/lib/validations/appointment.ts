import { z } from 'zod';

export const appointmentStatusSchema = z.enum(['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show']);

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('Valid patient ID required'),
  doctorId: z.string().uuid('Valid doctor ID required'),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  reason: z.string().max(255).optional(),
  notes: z.string().optional(),
});

export const appointmentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  doctorId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  status: appointmentStatusSchema.optional(),
  date: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type AppointmentListQuery = z.infer<typeof appointmentListQuerySchema>;
