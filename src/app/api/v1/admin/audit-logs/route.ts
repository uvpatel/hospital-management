import { NextResponse } from 'next/server';
import { getAuditLogsService } from '@/lib/services/admin.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requirePermission('audit.read');
    const logs = await getAuditLogsService();
    return NextResponse.json({ data: logs });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
