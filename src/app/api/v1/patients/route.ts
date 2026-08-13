import { NextRequest, NextResponse } from 'next/server';
import { patientListQuerySchema, createPatientSchema } from '@/lib/validations/patient';
import { listPatientsService, createPatientService } from '@/lib/services/patient.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('patients.read');

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validatedParams = patientListQuerySchema.parse(searchParams);

    const result = await listPatientsService(validatedParams);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters' } },
        { status: 400 }
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

export async function POST(request: NextRequest) {
  try {
    await requirePermission('patients.create');

    const body = await request.json();
    const validatedBody = createPatientSchema.parse(body);

    const newPatient = await createPatientService(validatedBody);
    return NextResponse.json({ data: newPatient }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Request validation failed' } },
        { status: 400 }
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
