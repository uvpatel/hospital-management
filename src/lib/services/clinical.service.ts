import { findDepartments, insertDepartment } from '@/db/queries/organization';
import { findDoctors, findDoctorById, insertDoctor, insertDoctorSchedule } from '@/db/queries/clinical';
import { CreateDepartmentInput, CreateDoctorInput, CreateDoctorScheduleInput } from '@/lib/validations/clinical';
import { logAudit } from '@/lib/audit';

function generateDoctorCode(): string {
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `DOC-${randomSuffix}`;
}

export async function getDepartmentsService() {
  return await findDepartments();
}

export async function createDepartmentService(input: CreateDepartmentInput) {
  const dept = await insertDepartment(input);
  await logAudit({
    action: 'CREATE',
    entityType: 'department',
    entityId: dept.id,
    details: { code: dept.code, name: dept.name },
  });
  return dept;
}

export async function getDoctorsService(search?: string, departmentId?: string) {
  return await findDoctors(search, departmentId);
}

export async function getDoctorByIdService(id: string) {
  const doctor = await findDoctorById(id);
  if (!doctor) {
    throw new Error('Doctor not found');
  }
  return doctor;
}

export async function createDoctorService(input: CreateDoctorInput) {
  const doctorCode = generateDoctorCode();
  const doctor = await insertDoctor({ ...input, doctorCode });

  await logAudit({
    action: 'CREATE',
    entityType: 'doctor',
    entityId: doctor.id,
    details: { doctorCode: doctor.doctorCode, name: `${doctor.firstName} ${doctor.lastName}` },
  });

  return doctor;
}

export async function addDoctorScheduleService(input: CreateDoctorScheduleInput) {
  const schedule = await insertDoctorSchedule(input);
  await logAudit({
    action: 'CREATE',
    entityType: 'doctor_schedule',
    entityId: schedule.id,
    details: { doctorId: schedule.doctorId, dayOfWeek: schedule.dayOfWeek },
  });
  return schedule;
}
