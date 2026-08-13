import { db } from '@/db';
import { patients } from '@/db/schema';
import { eq, or, ilike, count, asc, desc, and } from 'drizzle-orm';
import { PatientListQuery } from '@/lib/validations/patient';

export async function findPatients(params: PatientListQuery) {
  const { page, pageSize, search, gender, sort, order } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(patients.firstName, `%${search}%`),
        ilike(patients.lastName, `%${search}%`),
        ilike(patients.patientNumber, `%${search}%`),
        ilike(patients.phone, `%${search}%`)
      )
    );
  }

  if (gender) {
    conditions.push(eq(patients.gender, gender));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const columnMap = {
    createdAt: patients.createdAt,
    firstName: patients.firstName,
    lastName: patients.lastName,
    patientNumber: patients.patientNumber,
  };

  const targetColumn = columnMap[sort] || patients.createdAt;
  const orderByClause = order === 'asc' ? asc(targetColumn) : desc(targetColumn);

  const [data, totalCountResult] = await Promise.all([
    db.select()
      .from(patients)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() })
      .from(patients)
      .where(whereClause),
  ]);

  const total = Number(totalCountResult[0]?.count || 0);

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

export async function findPatientById(id: string) {
  const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return patient || null;
}

export async function findPatientByNumber(patientNumber: string) {
  const [patient] = await db.select().from(patients).where(eq(patients.patientNumber, patientNumber)).limit(1);
  return patient || null;
}

export async function insertPatient(data: typeof patients.$inferInsert) {
  const [newPatient] = await db.insert(patients).values(data).returning();
  return newPatient;
}

export async function updatePatientById(id: string, data: Partial<typeof patients.$inferInsert>) {
  const [updated] = await db
    .update(patients)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(patients.id, id))
    .returning();
  return updated || null;
}
