import { db } from '@/db';
import { chargeCatalog, invoices, invoiceItems, payments, expenses } from '@/db/schema';
import { findChargeCatalog, findInvoices, findInvoiceById, findExpenses } from '@/db/queries/billing';
import { CreateChargeCatalogItemInput, CreateInvoiceInput, RecordPaymentInput, CreateExpenseInput } from '@/lib/validations/billing';
import { logAudit } from '@/lib/audit';
import { eq } from 'drizzle-orm';

function generateInvoiceNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomSuffix}`;
}

function generatePaymentNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PAY-${dateStr}-${randomSuffix}`;
}

function generateExpenseNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `EXP-${dateStr}-${randomSuffix}`;
}

export async function getChargeCatalogService() {
  return await findChargeCatalog();
}

export async function createChargeCatalogItemService(input: CreateChargeCatalogItemInput) {
  const [item] = await db
    .insert(chargeCatalog)
    .values({
      ...input,
      defaultAmount: input.defaultAmount.toString(),
    })
    .returning();

  await logAudit({ action: 'CREATE', entityType: 'charge_catalog', entityId: item.id, details: { code: item.code, name: item.name } });
  return item;
}

export async function getInvoicesService() {
  return await findInvoices();
}

export async function getInvoiceByIdService(id: string) {
  const inv = await findInvoiceById(id);
  if (!inv) throw new Error('Invoice not found');
  return inv;
}

export async function createInvoiceService(input: CreateInvoiceInput, createdByUserId: string) {
  const invoiceNumber = generateInvoiceNumber();

  return await db.transaction(async (tx) => {
    // 1. Calculate authoritative totals
    let subtotalNum = 0;
    let discountTotalNum = 0;
    let taxTotalNum = 0;

    const preparedItems = input.items.map((item) => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const lineTotal = lineSubtotal - item.discountAmount + item.taxAmount;

      subtotalNum += lineSubtotal;
      discountTotalNum += item.discountAmount;
      taxTotalNum += item.taxAmount;

      return {
        descriptionSnapshot: item.descriptionSnapshot,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        discountAmount: item.discountAmount.toString(),
        taxAmount: item.taxAmount.toString(),
        lineTotal: lineTotal.toString(),
      };
    });

    const grandTotalNum = subtotalNum - discountTotalNum + taxTotalNum;

    // 2. Insert Invoice
    const [inv] = await tx
      .insert(invoices)
      .values({
        invoiceNumber,
        patientId: input.patientId,
        encounterId: input.encounterId,
        admissionId: input.admissionId,
        status: 'issued',
        issuedAt: new Date(),
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
        subtotal: subtotalNum.toFixed(2),
        discountTotal: discountTotalNum.toFixed(2),
        taxTotal: taxTotalNum.toFixed(2),
        grandTotal: grandTotalNum.toFixed(2),
        amountPaid: '0.00',
        balanceDue: grandTotalNum.toFixed(2),
        createdBy: createdByUserId,
      })
      .returning();

    // 3. Insert Line Items
    const itemsToInsert = preparedItems.map((item) => ({
      invoiceId: inv.id,
      ...item,
    }));

    await tx.insert(invoiceItems).values(itemsToInsert);

    await logAudit({
      action: 'CREATE',
      entityType: 'invoice',
      entityId: inv.id,
      details: { invoiceNumber: inv.invoiceNumber, grandTotal: inv.grandTotal },
    });

    return inv;
  });
}

export async function recordPaymentService(input: RecordPaymentInput, receivedByUserId: string) {
  const inv = await getInvoiceByIdService(input.invoiceId);
  if (inv.status === 'paid' || inv.status === 'void') {
    throw new Error(`Cannot record payment for invoice with status: ${inv.status}`);
  }

  const paymentNumber = generatePaymentNumber();

  return await db.transaction(async (tx) => {
    // 1. Insert Payment
    const [pmt] = await tx
      .insert(payments)
      .values({
        paymentNumber,
        invoiceId: input.invoiceId,
        amount: input.amount.toString(),
        paymentMethod: input.paymentMethod,
        transactionReference: input.transactionReference,
        note: input.note,
        status: 'completed',
        receivedBy: receivedByUserId,
      })
      .returning();

    // 2. Recompute total amount paid & balance due from DB payments
    const allPayments = await tx
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, input.invoiceId));

    const totalPaidNum = allPayments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const grandTotalNum = parseFloat(inv.grandTotal);
    const balanceDueNum = Math.max(0, grandTotalNum - totalPaidNum);

    let newStatus: typeof invoices.$inferSelect['status'] = inv.status;
    if (balanceDueNum === 0) {
      newStatus = 'paid';
    } else if (totalPaidNum > 0) {
      newStatus = 'partially_paid';
    }

    // 3. Update Invoice totals & status
    await tx
      .update(invoices)
      .set({
        amountPaid: totalPaidNum.toFixed(2),
        balanceDue: balanceDueNum.toFixed(2),
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, input.invoiceId));

    await logAudit({
      action: 'CREATE',
      entityType: 'payment',
      entityId: pmt.id,
      details: { paymentNumber: pmt.paymentNumber, amount: pmt.amount, newStatus },
    });

    return pmt;
  });
}

export async function getExpensesService() {
  return await findExpenses();
}

export async function createExpenseService(input: CreateExpenseInput, recordedByUserId: string) {
  const expenseNumber = generateExpenseNumber();

  const [exp] = await db
    .insert(expenses)
    .values({
      expenseNumber,
      category: input.category,
      description: input.description,
      amount: input.amount.toString(),
      expenseDate: new Date(input.expenseDate),
      paymentMethod: input.paymentMethod,
      vendorName: input.vendorName,
      referenceNumber: input.referenceNumber,
      recordedBy: recordedByUserId,
    })
    .returning();

  await logAudit({
    action: 'CREATE',
    entityType: 'expense',
    entityId: exp.id,
    details: { expenseNumber: exp.expenseNumber, amount: exp.amount },
  });

  return exp;
}
