import { NextRequest, NextResponse } from 'next/server';
import { appointmentListQuerySchema, createAppointmentSchema } from '@/lib/validations/appointment';
import { listAppointmentsService, createAppointmentService } from '@/lib/services/appointment.service';
import { requirePermission, requireAuth } from '@/lib/auth/rbac';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('appointments.read');

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validated = appointmentListQuerySchema.parse(searchParams);

    const result = await listAppointmentsService(validated);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Error fetching appointments' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('appointments.create');
    const session = await requireAuth();

    const body = await request.json();
    const validatedBody = createAppointmentSchema.parse(body);

    const newApt = await createAppointmentService(validatedBody, session.userId);
    return NextResponse.json({ data: newApt }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Validation failed' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Error creating appointment' } },
      { status: 500 }
    );
  }
}
