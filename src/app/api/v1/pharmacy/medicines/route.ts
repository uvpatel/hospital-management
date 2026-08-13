import { NextRequest, NextResponse } from 'next/server';
import { createMedicineSchema } from '@/lib/validations/pharmacy';
import { getMedicinesService, createMedicineService } from '@/lib/services/pharmacy.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requirePermission('pharmacy.read');
    const meds = await getMedicinesService();
    return NextResponse.json({ data: meds });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('pharmacy.manage');

    const body = await request.json();
    const validatedBody = createMedicineSchema.parse(body);

    const med = await createMedicineService(validatedBody);
    return NextResponse.json({ data: med }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Validation failed' } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
