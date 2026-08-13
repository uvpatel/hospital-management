import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(50).optional(),
  roleIds: z.array(z.string().uuid()).optional(),
});

export const updateHospitalSettingsSchema = z.object({
  hospitalName: z.string().min(1).max(255),
  registrationNumber: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
  addressLine1: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateHospitalSettingsInput = z.infer<typeof updateHospitalSettingsSchema>;
