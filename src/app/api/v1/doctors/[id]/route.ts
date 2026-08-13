import { NextRequest, NextResponse } from 'next/server';
import { getDoctorByIdService } from '@/lib/services/clinical.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('users.manage');
    const { id } = await params;

    const doctor = await getDoctorByIdService(id);
    return NextResponse.json({ data: doctor });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === 'Doctor not found') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Doctor not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Error fetching doctor' } },
      { status: 500 }
    );
  }
}
