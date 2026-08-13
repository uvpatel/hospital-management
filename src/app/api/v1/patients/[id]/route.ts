import { NextRequest, NextResponse } from 'next/server';
import { updatePatientSchema } from '@/lib/validations/patient';
import { getPatientByIdService, updatePatientService } from '@/lib/services/patient.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('patients.read');
    const { id } = await params;

    const patient = await getPatientByIdService(id);
    return NextResponse.json({ data: patient });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === 'Patient not found') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Patient not found' } },
        { status: 404 }
      );
    }
    if (err.message?.includes('Unauthorized') || err.message?.includes('Unauthenticated')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: err.message } },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('patients.update');
    const { id } = await params;

    const body = await request.json();
    const validatedBody = updatePatientSchema.parse(body);

    const updatedPatient = await updatePatientService(id, validatedBody);
    return NextResponse.json({ data: updatedPatient });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Request validation failed' } },
        { status: 400 }
      );
    }
    if (err.message === 'Patient not found') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Patient not found' } },
        { status: 404 }
      );
    }
    if (err.message?.includes('Unauthorized') || err.message?.includes('Unauthenticated')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: err.message } },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
