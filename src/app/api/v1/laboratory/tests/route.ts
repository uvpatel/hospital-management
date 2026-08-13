import { NextRequest, NextResponse } from 'next/server';
import { createLabTestSchema } from '@/lib/validations/laboratory';
import { getLabTestsService, createLabTestService } from '@/lib/services/laboratory.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requirePermission('laboratory.read');
    const tests = await getLabTestsService();
    return NextResponse.json({ data: tests });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('laboratory.manage');

    const body = await request.json();
    const validatedBody = createLabTestSchema.parse(body);

    const test = await createLabTestService(validatedBody);
    return NextResponse.json({ data: test }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Validation failed' } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
