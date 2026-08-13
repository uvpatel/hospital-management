import { findPatients, findPatientById, insertPatient, updatePatientById } from '@/db/queries/patients';
import { CreatePatientInput, UpdatePatientInput, PatientListQuery } from '@/lib/validations/patient';
import { logAudit } from '@/lib/audit';

function generatePatientNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PAT-${dateStr}-${randomSuffix}`;
}

export async function listPatientsService(params: PatientListQuery) {
  return await findPatients(params);
}

export async function getPatientByIdService(id: string) {
  const patient = await findPatientById(id);
  if (!patient) {
    throw new Error('Patient not found');
  }
  return patient;
}

export async function createPatientService(input: CreatePatientInput) {
  const patientNumber = generatePatientNumber();

  const newPatient = await insertPatient({
    ...input,
    patientNumber,
    email: input.email || null,
  });

  await logAudit({
    action: 'CREATE',
    entityType: 'patient',
    entityId: newPatient.id,
    details: { patientNumber: newPatient.patientNumber, name: `${newPatient.firstName} ${newPatient.lastName}` },
  });

  return newPatient;
}

export async function updatePatientService(id: string, input: UpdatePatientInput) {
  const existing = await findPatientById(id);
  if (!existing) {
    throw new Error('Patient not found');
  }

  const updated = await updatePatientById(id, {
    ...input,
    email: input.email === '' ? null : input.email,
  });

  await logAudit({
    action: 'UPDATE',
    entityType: 'patient',
    entityId: id,
    details: { changes: input },
  });

  return updated;
}
