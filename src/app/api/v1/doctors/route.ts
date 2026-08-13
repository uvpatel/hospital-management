import { NextRequest, NextResponse } from 'next/server';
import { createDoctorSchema } from '@/lib/validations/clinical';
import { getDoctorsService, createDoctorService } from '@/lib/services/clinical.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('users.manage');

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;

    const doctors = await getDoctorsService(search, departmentId);
    return NextResponse.json({ data: doctors });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Error fetching doctors' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('users.manage');

    const body = await request.json();
    const validatedBody = createDoctorSchema.parse(body);

    const newDoctor = await createDoctorService(validatedBody);
    return NextResponse.json({ data: newDoctor }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Validation failed' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Error creating doctor' } },
      { status: 500 }
    );
  }
}
