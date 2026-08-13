import { db } from '@/db';
import { labOrders, labOrderItems, labTests } from '@/db/schema';
import { findLabTests, findLabOrders, findLabOrderById, insertLabTest } from '@/db/queries/laboratory';
import { CreateLabTestInput, CreateLabOrderInput, RecordLabResultInput } from '@/lib/validations/laboratory';
import { logAudit } from '@/lib/audit';
import { eq, inArray } from 'drizzle-orm';

function generateLabOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `LAB-${dateStr}-${randomSuffix}`;
}

export async function getLabTestsService() {
  return await findLabTests();
}

export async function createLabTestService(input: CreateLabTestInput) {
  const test = await insertLabTest(input);
  await logAudit({ action: 'CREATE', entityType: 'lab_test', entityId: test.id, details: { name: test.name } });
  return test;
}

export async function getLabOrdersService() {
  return await findLabOrders();
}

export async function getLabOrderByIdService(id: string) {
  const order = await findLabOrderById(id);
  if (!order) throw new Error('Lab order not found');
  return order;
}

export async function createLabOrderService(input: CreateLabOrderInput) {
  const labOrderNumber = generateLabOrderNumber();

  return await db.transaction(async (tx) => {
    const tests = await tx.select().from(labTests).where(inArray(labTests.id, input.testIds));
    if (tests.length === 0) throw new Error('No valid lab tests selected');

    const [order] = await tx
      .insert(labOrders)
      .values({
        labOrderNumber,
        patientId: input.patientId,
        orderedByDoctorId: input.orderedByDoctorId,
        encounterId: input.encounterId,
        admissionId: input.admissionId,
        status: 'ordered',
      })
      .returning();

    const itemsToInsert = tests.map((t) => ({
      labOrderId: order.id,
      labTestId: t.id,
      testNameSnapshot: t.name,
      priceSnapshot: t.price,
      status: 'ordered' as const,
      referenceRangeSnapshot: t.referenceRange,
      unitSnapshot: t.unit,
    }));

    await tx.insert(labOrderItems).values(itemsToInsert);

    await logAudit({
      action: 'CREATE',
      entityType: 'lab_order',
      entityId: order.id,
      details: { labOrderNumber: order.labOrderNumber, testCount: tests.length },
    });

    return order;
  });
}

export async function recordLabResultService(itemId: string, input: RecordLabResultInput, userId: string) {
  const [item] = await db.select().from(labOrderItems).where(eq(labOrderItems.id, itemId)).limit(1);
  if (!item) throw new Error('Lab order item not found');

  const [updated] = await db
    .update(labOrderItems)
    .set({
      resultValue: input.resultValue,
      resultText: input.resultText,
      status: 'completed',
      resultedByUserId: userId,
      resultedAt: new Date(),
    })
    .where(eq(labOrderItems.id, itemId))
    .returning();

  await logAudit({ action: 'UPDATE', entityType: 'lab_order_item', entityId: itemId, details: { resultValue: input.resultValue } });
  return updated;
}
