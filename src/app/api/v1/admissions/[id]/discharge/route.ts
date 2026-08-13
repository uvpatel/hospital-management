import { NextRequest, NextResponse } from 'next/server';
import { dischargeAdmissionSchema } from '@/lib/validations/inpatient';
import { dischargeAdmissionService } from '@/lib/services/inpatient.service';
import { requirePermission, requireAuth } from '@/lib/auth/rbac';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('admissions.manage');
    const session = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const validatedBody = dischargeAdmissionSchema.parse(body);

    const discharged = await dischargeAdmissionService(id, validatedBody, session.userId);
    return NextResponse.json({ data: discharged });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: { code: 'STATE_ERROR', message: err.message } }, { status: 400 });
  }
}
