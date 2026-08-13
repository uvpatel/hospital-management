import { db } from '@/db';
import { appointments, patients, doctors } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { AppointmentListQuery } from '@/lib/validations/appointment';

export async function findAppointments(params: AppointmentListQuery) {
  const { page, pageSize, doctorId, patientId, status } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (doctorId) conditions.push(eq(appointments.doctorId, doctorId));
  if (patientId) conditions.push(eq(appointments.patientId, patientId));
  if (status) conditions.push(eq(appointments.status, status));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalResult] = await Promise.all([
    db.select({
      id: appointments.id,
      appointmentNumber: appointments.appointmentNumber,
      scheduledStart: appointments.scheduledStart,
      scheduledEnd: appointments.scheduledEnd,
      status: appointments.status,
      reason: appointments.reason,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
      patientId: appointments.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientNumber: patients.patientNumber,
      doctorId: appointments.doctorId,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
      doctorSpecialization: doctors.specialization,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .where(whereClause)
    .orderBy(desc(appointments.scheduledStart))
    .limit(pageSize)
    .offset(offset),
    db.select({ count: count() }).from(appointments).where(whereClause),
  ]);

  const total = Number(totalResult[0]?.count || 0);

  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function findAppointmentById(id: string) {
  const [apt] = await db
    .select({
      id: appointments.id,
      appointmentNumber: appointments.appointmentNumber,
      scheduledStart: appointments.scheduledStart,
      scheduledEnd: appointments.scheduledEnd,
      status: appointments.status,
      reason: appointments.reason,
      notes: appointments.notes,
      cancellationReason: appointments.cancellationReason,
      checkedInAt: appointments.checkedInAt,
      startedAt: appointments.startedAt,
      completedAt: appointments.completedAt,
      patientId: appointments.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientNumber: patients.patientNumber,
      doctorId: appointments.doctorId,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
      doctorSpecialization: doctors.specialization,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .where(eq(appointments.id, id))
    .limit(1);

  return apt || null;
}

export async function insertAppointment(data: typeof appointments.$inferInsert) {
  const [newApt] = await db.insert(appointments).values(data).returning();
  return newApt;
}

export async function updateAppointmentStatus(
  id: string,
  status: typeof appointments.$inferSelect['status'],
  updates: Partial<typeof appointments.$inferInsert> = {}
) {
  const [updated] = await db
    .update(appointments)
    .set({
      status,
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, id))
    .returning();

  return updated || null;
}
