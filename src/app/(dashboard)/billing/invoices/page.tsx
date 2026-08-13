import { getInvoicesService, getChargeCatalogService } from '@/lib/services/billing.service';
import { listPatientsService } from '@/lib/services/patient.service';
import { InvoiceListClient } from '@/components/billing/invoice-list-client';
import { requirePermission } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  await requirePermission('billing.read');

  const [invoices, chargeCatalog, patientsRes] = await Promise.all([
    getInvoicesService(),
    getChargeCatalogService(),
    listPatientsService({ page: 1, pageSize: 100, sort: 'firstName', order: 'asc' }),
  ]);

  const formattedPatients = patientsRes.data.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    patientNumber: p.patientNumber,
  }));

  return (
    <InvoiceListClient
      invoices={invoices}
      patients={formattedPatients}
      chargeCatalog={chargeCatalog}
    />
  );
}
