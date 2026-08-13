import { db } from '@/db';
import { admissions, beds, bedAllocations, clinicalNotes } from '@/db/schema';
import { findAdmissions, findAdmissionById, findActiveBedAllocation, findAvailableBeds } from '@/db/queries/inpatient';
import { CreateAdmissionInput, TransferBedInput, DischargeAdmissionInput, AddClinicalNoteInput } from '@/lib/validations/inpatient';
import { logAudit } from '@/lib/audit';
import { eq } from 'drizzle-orm';

function generateAdmissionNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ADM-${dateStr}-${randomSuffix}`;
}

export async function listAdmissionsService() {
  return await findAdmissions();
}

export async function getAvailableBedsService() {
  return await findAvailableBeds();
}

export async function getAdmissionByIdService(id: string) {
  const adm = await findAdmissionById(id);
  if (!adm) throw new Error('Admission not found');
  return adm;
}

export async function createAdmissionService(input: CreateAdmissionInput, createdByUserId: string) {
  const admissionNumber = generateAdmissionNumber();

  return await db.transaction(async (tx) => {
    const [adm] = await tx
      .insert(admissions)
      .values({
        admissionNumber,
        patientId: input.patientId,
        attendingDoctorId: input.attendingDoctorId,
        admissionReason: input.admissionReason,
        status: 'admitted',
        createdBy: createdByUserId,
      })
      .returning();

    if (input.bedId) {
      // Validate bed is available
      const [targetBed] = await tx.select().from(beds).where(eq(beds.id, input.bedId)).limit(1);
      if (!targetBed || targetBed.status !== 'available') {
        throw new Error('Selected bed is not available');
      }

      // Mark bed as occupied
      await tx.update(beds).set({ status: 'occupied' }).where(eq(beds.id, input.bedId));

      // Allocate bed
      await tx.insert(bedAllocations).values({
        admissionId: adm.id,
        bedId: input.bedId,
        allocatedBy: createdByUserId,
      });
    }

    await logAudit({
      action: 'CREATE',
      entityType: 'admission',
      entityId: adm.id,
      details: { admissionNumber: adm.admissionNumber, patientId: adm.patientId },
    });

    return adm;
  });
}

export async function transferBedService(admissionId: string, input: TransferBedInput, userId: string) {
  const adm = await getAdmissionByIdService(admissionId);
  if (adm.status !== 'admitted') {
    throw new Error(`Cannot transfer bed for admission with status: ${adm.status}`);
  }

  return await db.transaction(async (tx) => {
    // Check new bed availability
    const [newBed] = await tx.select().from(beds).where(eq(beds.id, input.newBedId)).limit(1);
    if (!newBed || newBed.status !== 'available') {
      throw new Error('Target bed is not available');
    }

    // End active bed allocation if exists
    const activeAlloc = await findActiveBedAllocation(admissionId);
    if (activeAlloc) {
      await tx
        .update(bedAllocations)
        .set({ endedAt: new Date(), endedBy: userId, transferReason: input.transferReason })
        .where(eq(bedAllocations.id, activeAlloc.id));

      // Release old bed to available
      await tx.update(beds).set({ status: 'available' }).where(eq(beds.id, activeAlloc.bedId));
    }

    // Occupy new bed
    await tx.update(beds).set({ status: 'occupied' }).where(eq(beds.id, input.newBedId));

    // Create new allocation
    const [newAlloc] = await tx
      .insert(bedAllocations)
      .values({
        admissionId,
        bedId: input.newBedId,
        allocatedBy: userId,
      })
      .returning();

    await logAudit({
      action: 'UPDATE',
      entityType: 'bed_allocation',
      entityId: newAlloc.id,
      details: { admissionId, newBedId: input.newBedId, transferReason: input.transferReason },
    });

    return newAlloc;
  });
}

export async function dischargeAdmissionService(id: string, input: DischargeAdmissionInput, userId: string) {
  const adm = await getAdmissionByIdService(id);
  if (adm.status !== 'admitted') {
    throw new Error('Admission is already discharged or cancelled');
  }

  return await db.transaction(async (tx) => {
    // End active bed allocation if any and release bed
    const activeAlloc = await findActiveBedAllocation(id);
    if (activeAlloc) {
      await tx
        .update(bedAllocations)
        .set({ endedAt: new Date(), endedBy: userId })
        .where(eq(bedAllocations.id, activeAlloc.id));

      await tx.update(beds).set({ status: 'available' }).where(eq(beds.id, activeAlloc.bedId));
    }

    // Update admission to discharged
    const [discharged] = await tx
      .update(admissions)
      .set({
        status: 'discharged',
        dischargedAt: new Date(),
        dischargeSummary: input.dischargeSummary,
        updatedAt: new Date(),
      })
      .where(eq(admissions.id, id))
      .returning();

    await logAudit({
      action: 'UPDATE',
      entityType: 'admission',
      entityId: id,
      details: { transition: 'discharged', summary: input.dischargeSummary },
    });

    return discharged;
  });
}

export async function addClinicalNoteService(admissionId: string, input: AddClinicalNoteInput, authorUserId: string) {
  const [note] = await db
    .insert(clinicalNotes)
    .values({
      admissionId,
      authorUserId,
      ...input,
    })
    .returning();

  await logAudit({
    action: 'CREATE',
    entityType: 'clinical_note',
    entityId: note.id,
    details: { admissionId, noteType: input.noteType },
  });

  return note;
}
