import { db } from '@/db';
import { labTests, labOrders, labOrderItems, patients, doctors } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateLabTestInput } from '@/lib/validations/laboratory';

export async function findLabTests() {
  return await db.select().from(labTests);
}

export async function findLabOrders() {
  return await db
    .select({
      id: labOrders.id,
      labOrderNumber: labOrders.labOrderNumber,
      status: labOrders.status,
      orderedAt: labOrders.orderedAt,
      completedAt: labOrders.completedAt,
      patientId: labOrders.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientNumber: patients.patientNumber,
      orderedByDoctorId: labOrders.orderedByDoctorId,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
    })
    .from(labOrders)
    .innerJoin(patients, eq(labOrders.patientId, patients.id))
    .innerJoin(doctors, eq(labOrders.orderedByDoctorId, doctors.id))
    .orderBy(desc(labOrders.orderedAt));
}

export async function findLabOrderById(id: string) {
  const [order] = await db
    .select({
      id: labOrders.id,
      labOrderNumber: labOrders.labOrderNumber,
      status: labOrders.status,
      orderedAt: labOrders.orderedAt,
      completedAt: labOrders.completedAt,
      patientId: labOrders.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientNumber: patients.patientNumber,
      orderedByDoctorId: labOrders.orderedByDoctorId,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
    })
    .from(labOrders)
    .innerJoin(patients, eq(labOrders.patientId, patients.id))
    .innerJoin(doctors, eq(labOrders.orderedByDoctorId, doctors.id))
    .where(eq(labOrders.id, id))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select()
    .from(labOrderItems)
    .where(eq(labOrderItems.labOrderId, id));

  return {
    ...order,
    items,
  };
}

export async function insertLabTest(data: CreateLabTestInput) {
  const [test] = await db.insert(labTests).values({
    ...data,
    price: data.price.toString(),
  }).returning();
  return test;
}
