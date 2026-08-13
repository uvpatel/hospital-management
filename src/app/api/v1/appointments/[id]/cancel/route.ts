import { NextRequest, NextResponse } from 'next/server';
import { cancelAppointmentService } from '@/lib/services/appointment.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('appointments.manage');
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const updated = await cancelAppointmentService(id, body.reason || 'Cancelled by staff');
    return NextResponse.json({ data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: { code: 'STATE_ERROR', message: err.message } }, { status: 400 });
  }
}
