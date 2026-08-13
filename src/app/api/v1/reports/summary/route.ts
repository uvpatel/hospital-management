import { NextResponse } from 'next/server';
import { getOperationalSummaryService } from '@/lib/services/admin.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requirePermission('reports.read');
    const summary = await getOperationalSummaryService();
    return NextResponse.json({ data: summary });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
