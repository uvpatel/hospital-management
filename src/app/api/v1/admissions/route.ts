import { NextRequest, NextResponse } from 'next/server';
import { createAdmissionSchema } from '@/lib/validations/inpatient';
import { listAdmissionsService, createAdmissionService } from '@/lib/services/inpatient.service';
import { requirePermission, requireAuth } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requirePermission('admissions.read');
    const admissions = await listAdmissionsService();
    return NextResponse.json({ data: admissions });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('admissions.manage');
    const session = await requireAuth();

    const body = await request.json();
    const validatedBody = createAdmissionSchema.parse(body);

    const adm = await createAdmissionService(validatedBody, session.userId);
    return NextResponse.json({ data: adm }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Validation failed' } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
