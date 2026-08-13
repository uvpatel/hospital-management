import { db } from '@/db';
import { doctors, doctorSchedules, departments } from '@/db/schema';
import { eq, or, ilike, asc, and } from 'drizzle-orm';
import { CreateDoctorInput, CreateDoctorScheduleInput } from '@/lib/validations/clinical';

export async function findDoctors(search?: string, departmentId?: string) {
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(doctors.firstName, `%${search}%`),
        ilike(doctors.lastName, `%${search}%`),
        ilike(doctors.specialization, `%${search}%`),
        ilike(doctors.doctorCode, `%${search}%`)
      )
    );
  }

  if (departmentId) {
    conditions.push(eq(doctors.departmentId, departmentId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select({
      id: doctors.id,
      doctorCode: doctors.doctorCode,
      registrationNumber: doctors.registrationNumber,
      firstName: doctors.firstName,
      lastName: doctors.lastName,
      phone: doctors.phone,
      email: doctors.email,
      specialization: doctors.specialization,
      qualification: doctors.qualification,
      consultationFee: doctors.consultationFee,
      isActive: doctors.isActive,
      departmentId: doctors.departmentId,
      departmentName: departments.name,
      createdAt: doctors.createdAt,
    })
    .from(doctors)
    .innerJoin(departments, eq(doctors.departmentId, departments.id))
    .where(whereClause)
    .orderBy(asc(doctors.firstName));
}

export async function findDoctorById(id: string) {
  const [doc] = await db
    .select({
      id: doctors.id,
      doctorCode: doctors.doctorCode,
      registrationNumber: doctors.registrationNumber,
      firstName: doctors.firstName,
      lastName: doctors.lastName,
      phone: doctors.phone,
      email: doctors.email,
      specialization: doctors.specialization,
      qualification: doctors.qualification,
      consultationFee: doctors.consultationFee,
      isActive: doctors.isActive,
      departmentId: doctors.departmentId,
      departmentName: departments.name,
      createdAt: doctors.createdAt,
    })
    .from(doctors)
    .innerJoin(departments, eq(doctors.departmentId, departments.id))
    .where(eq(doctors.id, id))
    .limit(1);

  if (!doc) return null;

  const schedules = await db
    .select()
    .from(doctorSchedules)
    .where(eq(doctorSchedules.doctorId, id));

  return {
    ...doc,
    schedules,
  };
}

export async function insertDoctor(data: CreateDoctorInput & { doctorCode: string }) {
  const [newDoc] = await db.insert(doctors).values({
    ...data,
    consultationFee: data.consultationFee.toString(),
  }).returning();
  return newDoc;
}

export async function insertDoctorSchedule(data: CreateDoctorScheduleInput) {
  const [newSchedule] = await db.insert(doctorSchedules).values(data).returning();
  return newSchedule;
}
