import { listAppointmentsService } from '@/lib/services/appointment.service';
import { listPatientsService } from '@/lib/services/patient.service';
import { getDoctorsService } from '@/lib/services/clinical.service';
import { appointmentListQuerySchema } from '@/lib/validations/appointment';
import { AppointmentListClient } from '@/components/appointments/appointment-list-client';
import { requirePermission } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

interface AppointmentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  await requirePermission('appointments.read');
  const params = await searchParams;

  const validated = appointmentListQuerySchema.parse({
    page: params.page,
    pageSize: params.pageSize,
    doctorId: params.doctorId,
    patientId: params.patientId,
    status: params.status,
  });

  const [{ data, meta }, patientsRes, doctorsRes] = await Promise.all([
    listAppointmentsService(validated),
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
    <AppointmentListClient
      initialData={data}
      meta={meta}
      patients={formattedPatients}
      doctors={formattedDoctors}
    />
  );
}
