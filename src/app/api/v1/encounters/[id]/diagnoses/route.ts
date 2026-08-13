import { NextRequest, NextResponse } from 'next/server';
import { addDiagnosisSchema } from '@/lib/validations/encounter';
import { addDiagnosisService } from '@/lib/services/encounter.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('encounters.write');
    const { id } = await params;

    const body = await request.json();
    const validatedBody = addDiagnosisSchema.parse(body);

    const diagnosis = await addDiagnosisService(id, validatedBody);
    return NextResponse.json({ data: diagnosis }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Validation failed' } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
