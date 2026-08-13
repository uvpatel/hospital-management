import { getMedicinesService } from '@/lib/services/pharmacy.service';
import { PharmacyListClient } from '@/components/pharmacy/pharmacy-list-client';
import { requirePermission } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

export default async function PharmacyPage() {
  await requirePermission('pharmacy.read');
  const medicines = await getMedicinesService();

  return <PharmacyListClient medicines={medicines} />;
}
