import { listAdmissionsService, getAvailableBedsService } from '@/lib/services/inpatient.service';
import { listPatientsService } from '@/lib/services/patient.service';
import { getDoctorsService } from '@/lib/services/clinical.service';
import { AdmissionListClient } from '@/components/inpatient/admission-list-client';
import { requirePermission } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

export default async function AdmissionsPage() {
  await requirePermission('admissions.read');

  const [admissions, availableBeds, patientsRes, doctorsRes] = await Promise.all([
    listAdmissionsService(),
    getAvailableBedsService(),
    listPatientsService({ page: 1, pageSize: 100, sort: 'firstName', order: 'asc' }),
    getDoctorsService(),
  ]);

  const formattedPatients = patientsRes.data.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    patientNumber: p.patientNumber,
  }));

  const formattedDoctors = doctorsRes.map((d) => ({
    id: d.id,
    name: `${d.firstName} ${d.lastName}`,
    specialization: d.specialization,
  }));

  return (
    <AdmissionListClient
      admissions={admissions}
      availableBeds={availableBeds}
      patients={formattedPatients}
      doctors={formattedDoctors}
    />
  );
}
