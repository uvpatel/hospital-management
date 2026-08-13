import { NextRequest, NextResponse } from 'next/server';
import { createEncounterSchema } from '@/lib/validations/encounter';
import { listEncountersService, createEncounterService } from '@/lib/services/encounter.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requirePermission('encounters.read');
    const encounters = await listEncountersService();
    return NextResponse.json({ data: encounters });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('encounters.write');

    const body = await request.json();
    const validatedBody = createEncounterSchema.parse(body);

    const newEnc = await createEncounterService(validatedBody);
    return NextResponse.json({ data: newEnc }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Validation failed' } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
