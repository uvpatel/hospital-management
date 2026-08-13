import { z } from 'zod';

export const genderSchema = z.enum(['male', 'female', 'other']);
export const bloodGroupSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional();

export const patientListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  gender: genderSchema.optional(),
  sort: z.enum(['createdAt', 'firstName', 'lastName', 'patientNumber']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD'),
  gender: genderSchema,
  bloodGroup: bloodGroupSchema,
  phone: z.string().min(1, 'Phone is required').max(50),
  alternatePhone: z.string().max(50).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  addressLine1: z.string().min(1, 'Address line 1 is required').max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required').max(100),
  emergencyContactRelationship: z.string().min(1, 'Relationship is required').max(100),
  emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required').max(50),
  allergies: z.string().optional(),
  medicalAlerts: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientListQuery = z.infer<typeof patientListQuerySchema>;
