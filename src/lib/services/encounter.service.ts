import {
  findEncounters,
  findEncounterById,
  insertEncounter,
  insertDiagnosis,
  insertPrescriptionWithItems,
  updateEncounterStatusToCompleted,
} from '@/db/queries/encounters';
import { CreateEncounterInput, AddDiagnosisInput, AddPrescriptionInput } from '@/lib/validations/encounter';
import { logAudit } from '@/lib/audit';
import { startAppointmentService } from './appointment.service';

function generateEncounterNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ENC-${dateStr}-${randomSuffix}`;
}

function generatePrescriptionNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RX-${dateStr}-${randomSuffix}`;
}

export async function listEncountersService() {
  return await findEncounters();
}

export async function getEncounterByIdService(id: string) {
  const enc = await findEncounterById(id);
  if (!enc) throw new Error('Encounter not found');
  return enc;
}

export async function createEncounterService(input: CreateEncounterInput) {
  const encounterNumber = generateEncounterNumber();

  if (input.appointmentId) {
    await startAppointmentService(input.appointmentId);
  }

  const newEnc = await insertEncounter({
    ...input,
    encounterNumber,
    status: 'in_progress',
  });

  await logAudit({
    action: 'CREATE',
    entityType: 'encounter',
    entityId: newEnc.id,
    details: { encounterNumber: newEnc.encounterNumber, patientId: newEnc.patientId, doctorId: newEnc.doctorId },
  });

  return newEnc;
}

export async function addDiagnosisService(encounterId: string, input: AddDiagnosisInput) {
  const enc = await getEncounterByIdService(encounterId);
  if (enc.status === 'completed') {
    throw new Error('Cannot modify completed encounter');
  }

  const diagnosis = await insertDiagnosis(encounterId, input);
  await logAudit({
    action: 'CREATE',
    entityType: 'diagnosis',
    entityId: diagnosis.id,
    details: { encounterId, description: diagnosis.description },
  });

  return diagnosis;
}

export async function addPrescriptionService(encounterId: string, input: AddPrescriptionInput) {
  const enc = await getEncounterByIdService(encounterId);
  if (enc.status === 'completed') {
    throw new Error('Cannot modify completed encounter');
  }

  const rxNumber = generatePrescriptionNumber();
  const rx = await insertPrescriptionWithItems(encounterId, enc.patientId, enc.doctorId, rxNumber, input);

  await logAudit({
    action: 'CREATE',
    entityType: 'prescription',
    entityId: rx.id,
    details: { prescriptionNumber: rx.prescriptionNumber, itemCount: input.items.length },
  });

  return rx;
}

export async function completeEncounterService(id: string) {
  const enc = await getEncounterByIdService(id);
  if (enc.status === 'completed') {
    throw new Error('Encounter is already completed');
  }

  const completed = await updateEncounterStatusToCompleted(id);
  await logAudit({
    action: 'UPDATE',
    entityType: 'encounter',
    entityId: id,
    details: { transition: 'completed' },
  });

  return completed;
}
