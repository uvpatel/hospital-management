import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { getSession } from './auth/session';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ACCESS' | 'APPROVE' | 'REJECT';

export async function logAudit(params: {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  const session = await getSession();
  if (!session) return;

  await db.insert(auditLogs).values({
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: params.details,
    actorUserId: session.userId,
    ipAddress: undefined,
    userAgent: undefined,
  });
}
