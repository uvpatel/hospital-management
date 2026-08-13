import { z } from 'zod';

export const createDepartmentSchema = z.object({
  code: z.string().min(1, 'Department code is required').max(50),
  name: z.string().min(1, 'Department name is required').max(100),
  description: z.string().max(500).optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createDoctorSchema = z.object({
  departmentId: z.string().uuid('Valid department ID is required'),
  registrationNumber: z.string().min(1, 'Registration number is required').max(100),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().min(1, 'Phone number is required').max(50),
  email: z.string().email('Valid email is required'),
  specialization: z.string().min(1, 'Specialization is required').max(255),
  qualification: z.string().max(255).optional(),
  consultationFee: z.coerce.number().min(0, 'Consultation fee must be >= 0'),
});

export const createDoctorScheduleSchema = z.object({
  doctorId: z.string().uuid(),
  dayOfWeek: z.number().min(0).max(6), // 0=Sun, 6=Sat
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:MM format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be HH:MM format'),
  slotDurationMinutes: z.number().positive().default(15),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type CreateDoctorScheduleInput = z.infer<typeof createDoctorScheduleSchema>;
