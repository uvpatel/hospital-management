import { NextRequest, NextResponse } from 'next/server';
import { completeEncounterService } from '@/lib/services/encounter.service';
import { requirePermission } from '@/lib/auth/rbac';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('encounters.write');
    const { id } = await params;

    const completed = await completeEncounterService(id);
    return NextResponse.json({ data: completed });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: { code: 'STATE_ERROR', message: err.message } }, { status: 400 });
  }
}
