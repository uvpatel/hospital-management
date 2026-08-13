import { NextRequest, NextResponse } from 'next/server';
import { recordPaymentSchema } from '@/lib/validations/billing';
import { recordPaymentService } from '@/lib/services/billing.service';
import { requirePermission, requireAuth } from '@/lib/auth/rbac';

export async function POST(request: NextRequest) {
  try {
    await requirePermission('billing.manage');
    const session = await requireAuth();

    const body = await request.json();
    const validatedBody = recordPaymentSchema.parse(body);

    const pmt = await recordPaymentService(validatedBody, session.userId);
    return NextResponse.json({ data: pmt }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Validation failed' } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
