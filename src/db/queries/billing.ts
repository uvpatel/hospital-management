import { db } from '@/db';
import { chargeCatalog, invoices, invoiceItems, payments, expenses, patients } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function findChargeCatalog() {
  return await db.select().from(chargeCatalog);
}

export async function findInvoices() {
  return await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      currencyCode: invoices.currencyCode,
      subtotal: invoices.subtotal,
      discountTotal: invoices.discountTotal,
      taxTotal: invoices.taxTotal,
      grandTotal: invoices.grandTotal,
      amountPaid: invoices.amountPaid,
      balanceDue: invoices.balanceDue,
      createdAt: invoices.createdAt,
      patientId: invoices.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientNumber: patients.patientNumber,
    })
    .from(invoices)
    .innerJoin(patients, eq(invoices.patientId, patients.id))
    .orderBy(desc(invoices.createdAt));
}

export async function findInvoiceById(id: string) {
  const [inv] = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      currencyCode: invoices.currencyCode,
      subtotal: invoices.subtotal,
      discountTotal: invoices.discountTotal,
      taxTotal: invoices.taxTotal,
      grandTotal: invoices.grandTotal,
      amountPaid: invoices.amountPaid,
      balanceDue: invoices.balanceDue,
      createdAt: invoices.createdAt,
      dueAt: invoices.dueAt,
      issuedAt: invoices.issuedAt,
      patientId: invoices.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientNumber: patients.patientNumber,
    })
    .from(invoices)
    .innerJoin(patients, eq(invoices.patientId, patients.id))
    .where(eq(invoices.id, id))
    .limit(1);

  if (!inv) return null;

  const [items, pmtList] = await Promise.all([
    db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id)),
    db.select().from(payments).where(eq(payments.invoiceId, id)).orderBy(desc(payments.receivedAt)),
  ]);

  return {
    ...inv,
    items,
    payments: pmtList,
  };
}

export async function findExpenses() {
  return await db.select().from(expenses).orderBy(desc(expenses.expenseDate));
}
