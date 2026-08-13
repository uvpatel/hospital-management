import { NextRequest, NextResponse } from 'next/server';
import { addPrescriptionSchema } from '@/lib/validations/encounter';
import { addPrescriptionService } from '@/lib/services/encounter.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('prescriptions.write');
    const { id } = await params;

    const body = await request.json();
    const validatedBody = addPrescriptionSchema.parse(body);

    const rx = await addPrescriptionService(id, validatedBody);
    return NextResponse.json({ data: rx }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Validation failed' } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
