import { NextRequest, NextResponse } from 'next/server';
import { createInvoiceSchema } from '@/lib/validations/billing';
import { getInvoicesService, createInvoiceService } from '@/lib/services/billing.service';
import { requirePermission, requireAuth } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requirePermission('billing.read');
    const invoices = await getInvoicesService();
    return NextResponse.json({ data: invoices });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('billing.manage');
    const session = await requireAuth();

    const body = await request.json();
    const validatedBody = createInvoiceSchema.parse(body);

    const inv = await createInvoiceService(validatedBody, session.userId);
    return NextResponse.json({ data: inv }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Validation failed' } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
