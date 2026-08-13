import { db } from '@/db';
import { medicines, medicineBatches, inventoryTransactions, dispensations, dispensationItems } from '@/db/schema';
import { findMedicines, findMedicineBatches, insertMedicine } from '@/db/queries/pharmacy';
import { CreateMedicineInput, CreateMedicineBatchInput, DispensePrescriptionInput } from '@/lib/validations/pharmacy';
import { logAudit } from '@/lib/audit';
import { eq } from 'drizzle-orm';

export async function getMedicinesService() {
  return await findMedicines();
}

export async function createMedicineService(input: CreateMedicineInput) {
  const med = await insertMedicine(input);
  await logAudit({ action: 'CREATE', entityType: 'medicine', entityId: med.id, details: { code: med.code, name: med.genericName } });
  return med;
}

export async function getMedicineBatchesService(medicineId?: string) {
  return await findMedicineBatches(medicineId);
}

export async function addMedicineBatchService(input: CreateMedicineBatchInput, userId: string) {
  return await db.transaction(async (tx) => {
    const [batch] = await tx
      .insert(medicineBatches)
      .values({
        ...input,
        expiryDate: new Date(input.expiryDate),
        purchasePrice: input.purchasePrice.toString(),
        salePrice: input.salePrice.toString(),
        quantityAvailable: input.quantityReceived,
      })
      .returning();

    await tx.insert(inventoryTransactions).values({
      medicineId: input.medicineId,
      batchId: batch.id,
      transactionType: 'receive',
      quantityDelta: input.quantityReceived,
      referenceType: 'purchase_batch',
      referenceId: batch.id,
      performedBy: userId,
    });

    await logAudit({ action: 'CREATE', entityType: 'medicine_batch', entityId: batch.id, details: { batchNumber: batch.batchNumber, qty: input.quantityReceived } });
    return batch;
  });
}

export async function dispensePrescriptionService(input: DispensePrescriptionInput, patientId: string, userId: string) {
  return await db.transaction(async (tx) => {
    // 1. Create Dispensation Record
    const [dispensation] = await tx
      .insert(dispensations)
      .values({
        prescriptionId: input.prescriptionId,
        patientId,
        dispensedBy: userId,
      })
      .returning();

    // 2. Process each item: check stock, deduct stock, record transaction
    for (const item of input.items) {
      const [batch] = await tx.select().from(medicineBatches).where(eq(medicineBatches.id, item.batchId)).limit(1);
      if (!batch) throw new Error(`Batch not found: ${item.batchId}`);
      if (batch.quantityAvailable < item.quantity) {
        throw new Error(`Insufficient stock in batch ${batch.batchNumber}. Available: ${batch.quantityAvailable}, requested: ${item.quantity}`);
      }

      // Deduct stock
      await tx
        .update(medicineBatches)
        .set({
          quantityAvailable: batch.quantityAvailable - item.quantity,
          updatedAt: new Date(),
        })
        .where(eq(medicineBatches.id, item.batchId));

      // Record immutable inventory transaction
      await tx.insert(inventoryTransactions).values({
        medicineId: item.medicineId,
        batchId: item.batchId,
        transactionType: 'dispense',
        quantityDelta: -item.quantity,
        referenceType: 'prescription_dispense',
        referenceId: dispensation.id,
        performedBy: userId,
      });

      // Record dispensation item snapshot
      await tx.insert(dispensationItems).values({
        dispensationId: dispensation.id,
        prescriptionItemId: item.prescriptionItemId,
        medicineId: item.medicineId,
        batchId: item.batchId,
        quantity: item.quantity,
        unitPriceSnapshot: batch.salePrice,
      });
    }

    await logAudit({
      action: 'CREATE',
      entityType: 'dispensation',
      entityId: dispensation.id,
      details: { prescriptionId: input.prescriptionId, itemCount: input.items.length },
    });

    return dispensation;
  });
}
