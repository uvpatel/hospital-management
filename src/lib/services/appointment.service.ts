import { findAppointments, findAppointmentById, insertAppointment, updateAppointmentStatus } from '@/db/queries/appointments';
import { CreateAppointmentInput, AppointmentListQuery } from '@/lib/validations/appointment';
import { logAudit } from '@/lib/audit';

function generateAppointmentNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `APT-${dateStr}-${randomSuffix}`;
}

export async function listAppointmentsService(params: AppointmentListQuery) {
  return await findAppointments(params);
}

export async function getAppointmentByIdService(id: string) {
  const apt = await findAppointmentById(id);
  if (!apt) throw new Error('Appointment not found');
  return apt;
}

export async function createAppointmentService(input: CreateAppointmentInput, bookedByUserId: string) {
  const appointmentNumber = generateAppointmentNumber();

  const newApt = await insertAppointment({
    ...input,
    appointmentNumber,
    scheduledStart: new Date(input.scheduledStart),
    scheduledEnd: new Date(input.scheduledEnd),
    bookedBy: bookedByUserId,
    status: 'scheduled',
  });

  await logAudit({
    action: 'CREATE',
    entityType: 'appointment',
    entityId: newApt.id,
    details: { appointmentNumber: newApt.appointmentNumber, patientId: newApt.patientId, doctorId: newApt.doctorId },
  });

  return newApt;
}

export async function checkInAppointmentService(id: string) {
  const apt = await getAppointmentByIdService(id);
  if (apt.status !== 'scheduled') {
    throw new Error(`Cannot check in appointment with status: ${apt.status}`);
  }

  const updated = await updateAppointmentStatus(id, 'checked_in', { checkedInAt: new Date() });
  await logAudit({ action: 'UPDATE', entityType: 'appointment', entityId: id, details: { transition: 'checked_in' } });
  return updated;
}

export async function startAppointmentService(id: string) {
  const apt = await getAppointmentByIdService(id);
  if (apt.status !== 'checked_in' && apt.status !== 'scheduled') {
    throw new Error(`Cannot start appointment with status: ${apt.status}`);
  }

  const updated = await updateAppointmentStatus(id, 'in_progress', { startedAt: new Date() });
  await logAudit({ action: 'UPDATE', entityType: 'appointment', entityId: id, details: { transition: 'in_progress' } });
  return updated;
}

export async function completeAppointmentService(id: string) {
  const apt = await getAppointmentByIdService(id);
  if (apt.status !== 'in_progress') {
    throw new Error(`Cannot complete appointment with status: ${apt.status}`);
  }

  const updated = await updateAppointmentStatus(id, 'completed', { completedAt: new Date() });
  await logAudit({ action: 'UPDATE', entityType: 'appointment', entityId: id, details: { transition: 'completed' } });
  return updated;
}

export async function cancelAppointmentService(id: string, cancellationReason: string) {
  const apt = await getAppointmentByIdService(id);
  if (apt.status === 'completed' || apt.status === 'cancelled') {
    throw new Error(`Cannot cancel appointment with status: ${apt.status}`);
  }

  const updated = await updateAppointmentStatus(id, 'cancelled', { cancellationReason });
  await logAudit({ action: 'UPDATE', entityType: 'appointment', entityId: id, details: { transition: 'cancelled', reason: cancellationReason } });
  return updated;
}
