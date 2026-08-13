import { NextRequest, NextResponse } from 'next/server';
import { createDepartmentSchema } from '@/lib/validations/clinical';
import { getDepartmentsService, createDepartmentService } from '@/lib/services/clinical.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requirePermission('settings.manage'); // Or general read permission
    const departments = await getDepartmentsService();
    return NextResponse.json({ data: departments });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Error fetching departments' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('settings.manage');

    const body = await request.json();
    const validatedBody = createDepartmentSchema.parse(body);

    const newDepartment = await createDepartmentService(validatedBody);
    return NextResponse.json({ data: newDepartment }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Validation failed' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Error creating department' } },
      { status: 500 }
    );
  }
}
