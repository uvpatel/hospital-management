import { db } from '@/db';
import { wards, rooms, beds, admissions, bedAllocations, clinicalNotes, patients, doctors } from '@/db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';

export async function findWards() {
  return await db.select().from(wards);
}

export async function findAvailableBeds() {
  return await db
    .select({
      id: beds.id,
      bedNumber: beds.bedNumber,
      status: beds.status,
      roomId: beds.roomId,
      roomNumber: rooms.roomNumber,
      dailyRate: rooms.dailyRate,
      wardId: rooms.wardId,
      wardName: wards.name,
    })
    .from(beds)
    .innerJoin(rooms, eq(beds.roomId, rooms.id))
    .innerJoin(wards, eq(rooms.wardId, wards.id))
    .where(eq(beds.status, 'available'));
}

export async function findAdmissions() {
  return await db
    .select({
      id: admissions.id,
      admissionNumber: admissions.admissionNumber,
      status: admissions.status,
      admissionReason: admissions.admissionReason,
      admittedAt: admissions.admittedAt,
      dischargedAt: admissions.dischargedAt,
      patientId: admissions.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientNumber: patients.patientNumber,
      attendingDoctorId: admissions.attendingDoctorId,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
    })
    .from(admissions)
    .innerJoin(patients, eq(admissions.patientId, patients.id))
    .innerJoin(doctors, eq(admissions.attendingDoctorId, doctors.id))
    .orderBy(desc(admissions.admittedAt));
}

export async function findAdmissionById(id: string) {
  const [adm] = await db
    .select({
      id: admissions.id,
      admissionNumber: admissions.admissionNumber,
      status: admissions.status,
      admissionReason: admissions.admissionReason,
      admittedAt: admissions.admittedAt,
      dischargedAt: admissions.dischargedAt,
      dischargeSummary: admissions.dischargeSummary,
      patientId: admissions.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientNumber: patients.patientNumber,
      attendingDoctorId: admissions.attendingDoctorId,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
    })
    .from(admissions)
    .innerJoin(patients, eq(admissions.patientId, patients.id))
    .innerJoin(doctors, eq(admissions.attendingDoctorId, doctors.id))
    .where(eq(admissions.id, id))
    .limit(1);

  if (!adm) return null;

  const [allocations, notes] = await Promise.all([
    db.select({
      id: bedAllocations.id,
      startedAt: bedAllocations.startedAt,
      endedAt: bedAllocations.endedAt,
      transferReason: bedAllocations.transferReason,
      bedNumber: beds.bedNumber,
      roomNumber: rooms.roomNumber,
      wardName: wards.name,
    })
    .from(bedAllocations)
    .innerJoin(beds, eq(bedAllocations.bedId, beds.id))
    .innerJoin(rooms, eq(beds.roomId, rooms.id))
    .innerJoin(wards, eq(rooms.wardId, wards.id))
    .where(eq(bedAllocations.admissionId, id))
    .orderBy(desc(bedAllocations.startedAt)),
    db.select().from(clinicalNotes).where(eq(clinicalNotes.admissionId, id)).orderBy(desc(clinicalNotes.createdAt)),
  ]);

  return {
    ...adm,
    allocations,
    notes,
  };
}

export async function findActiveBedAllocation(admissionId: string) {
  const [active] = await db
    .select()
    .from(bedAllocations)
    .where(and(eq(bedAllocations.admissionId, admissionId), isNull(bedAllocations.endedAt)))
    .limit(1);
  return active || null;
}
