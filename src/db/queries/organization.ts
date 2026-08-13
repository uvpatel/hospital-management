import { db } from '@/db';
import { departments } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { CreateDepartmentInput } from '@/lib/validations/clinical';

export async function findDepartments() {
  return await db.select().from(departments).orderBy(asc(departments.name));
}

export async function findDepartmentById(id: string) {
  const [dept] = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
  return dept || null;
}

export async function insertDepartment(data: CreateDepartmentInput) {
  const [newDept] = await db.insert(departments).values(data).returning();
  return newDept;
}
