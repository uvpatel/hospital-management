import { db } from '@/db';
import { users, roles, auditLogs, hospitalSettings, patients, appointments, admissions, invoices, payments } from '@/db/schema';
import { desc, count, sum, eq } from 'drizzle-orm';

export async function findUsers() {
  return await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function findRoles() {
  return await db.select().from(roles);
}

export async function findAuditLogs() {
  return await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
      actorUserId: auditLogs.actorUserId,
    })
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);
}

export async function findHospitalSettings() {
  const [settings] = await db.select().from(hospitalSettings).limit(1);
  return settings || null;
}

export async function getOperationalSummary() {
  const [
    patientCountResult,
    appointmentCountResult,
    admissionCountResult,
    revenueResult,
    paidInvoicesResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(patients),
    db.select({ count: count() }).from(appointments),
    db.select({ count: count() }).from(admissions),
    db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'completed')),
    db.select({ total: sum(invoices.grandTotal) }).from(invoices).where(eq(invoices.status, 'paid')),
  ]);

  return {
    totalPatients: Number(patientCountResult[0]?.count || 0),
    totalAppointments: Number(appointmentCountResult[0]?.count || 0),
    totalAdmissions: Number(admissionCountResult[0]?.count || 0),
    totalCollectedRevenue: Number(revenueResult[0]?.total || 0),
    totalBilledRevenue: Number(paidInvoicesResult[0]?.total || 0),
  };
}
