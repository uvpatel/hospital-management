import { NextResponse } from 'next/server';
import { getAvailableBedsService } from '@/lib/services/inpatient.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requirePermission('admissions.read');
    const beds = await getAvailableBedsService();
    return NextResponse.json({ data: beds });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
