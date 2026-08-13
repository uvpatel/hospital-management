import { db } from '@/db';
import { encounters, diagnoses, prescriptions, prescriptionItems, patients, doctors } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { AddDiagnosisInput, AddPrescriptionInput } from '@/lib/validations/encounter';

export async function findEncounters() {
  return await db
    .select({
      id: encounters.id,
      encounterNumber: encounters.encounterNumber,
      status: encounters.status,
      chiefComplaint: encounters.chiefComplaint,
      startedAt: encounters.startedAt,
      completedAt: encounters.completedAt,
      patientId: encounters.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorId: encounters.doctorId,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
    })
    .from(encounters)
    .innerJoin(patients, eq(encounters.patientId, patients.id))
    .innerJoin(doctors, eq(encounters.doctorId, doctors.id))
    .orderBy(desc(encounters.startedAt));
}

export async function findEncounterById(id: string) {
  const [enc] = await db
    .select({
      id: encounters.id,
      encounterNumber: encounters.encounterNumber,
      status: encounters.status,
      chiefComplaint: encounters.chiefComplaint,
      history: encounters.history,
      examinationNotes: encounters.examinationNotes,
      diagnosisSummary: encounters.diagnosisSummary,
      treatmentPlan: encounters.treatmentPlan,
      startedAt: encounters.startedAt,
      completedAt: encounters.completedAt,
      patientId: encounters.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorId: encounters.doctorId,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
    })
    .from(encounters)
    .innerJoin(patients, eq(encounters.patientId, patients.id))
    .innerJoin(doctors, eq(encounters.doctorId, doctors.id))
    .where(eq(encounters.id, id))
    .limit(1);

  if (!enc) return null;

  const [diagList, rxList] = await Promise.all([
    db.select().from(diagnoses).where(eq(diagnoses.encounterId, id)),
    db.select().from(prescriptions).where(eq(prescriptions.encounterId, id)),
  ]);

  return {
    ...enc,
    diagnoses: diagList,
    prescriptions: rxList,
  };
}

export async function insertEncounter(data: typeof encounters.$inferInsert) {
  const [newEnc] = await db.insert(encounters).values(data).returning();
  return newEnc;
}

export async function insertDiagnosis(encounterId: string, data: AddDiagnosisInput) {
  const [newDiag] = await db.insert(diagnoses).values({
    encounterId,
    ...data,
  }).returning();
  return newDiag;
}

export async function insertPrescriptionWithItems(
  encounterId: string,
  patientId: string,
  doctorId: string,
  prescriptionNumber: string,
  data: AddPrescriptionInput
) {
  return await db.transaction(async (tx) => {
    const [rx] = await tx.insert(prescriptions).values({
      prescriptionNumber,
      encounterId,
      patientId,
      doctorId,
      notes: data.notes,
      status: 'active',
    }).returning();

    const itemsToInsert = data.items.map((item) => ({
      prescriptionId: rx.id,
      ...item,
    }));

    await tx.insert(prescriptionItems).values(itemsToInsert);

    return rx;
  });
}

export async function updateEncounterStatusToCompleted(id: string) {
  const [updated] = await db
    .update(encounters)
    .set({
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(encounters.id, id))
    .returning();

  return updated;
}
