import { getDoctorsService, getDepartmentsService } from '@/lib/services/clinical.service';
import { DoctorListClient } from '@/components/doctors/doctor-list-client';
import { requirePermission } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

export default async function DoctorsPage() {
  await requirePermission('users.manage');

  const [doctors, departments] = await Promise.all([
    getDoctorsService(),
    getDepartmentsService(),
  ]);

  return <DoctorListClient doctors={doctors} departments={departments} />;
}
