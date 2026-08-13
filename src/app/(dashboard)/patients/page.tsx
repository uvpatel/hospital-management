import { listPatientsService } from '@/lib/services/patient.service';
import { patientListQuerySchema } from '@/lib/validations/patient';
import { PatientListClient } from '@/components/patients/patient-list-client';
import { requirePermission } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

interface PatientsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  await requirePermission('patients.read');
  const params = await searchParams;

  const validated = patientListQuerySchema.parse({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    gender: params.gender,
    sort: params.sort,
    order: params.order,
  });

  const { data, meta } = await listPatientsService(validated);

  return <PatientListClient initialData={data} meta={meta} />;
}
