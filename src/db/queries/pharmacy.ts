import { db } from '@/db';
import { medicines, medicineBatches, inventoryTransactions, dispensations, dispensationItems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateMedicineInput } from '@/lib/validations/pharmacy';

export async function findMedicines() {
  return await db.select().from(medicines);
}

export async function findMedicineBatches(medicineId?: string) {
  const query = db.select().from(medicineBatches);
  if (medicineId) {
    return await query.where(eq(medicineBatches.medicineId, medicineId));
  }
  return await query;
}

export async function findMedicineById(id: string) {
  const [med] = await db.select().from(medicines).where(eq(medicines.id, id)).limit(1);
  return med || null;
}

export async function insertMedicine(data: CreateMedicineInput) {
  const [med] = await db.insert(medicines).values(data).returning();
  return med;
}

export async function findDispensations() {
  return await db.select().from(dispensations).orderBy(desc(dispensations.dispensedAt));
}
