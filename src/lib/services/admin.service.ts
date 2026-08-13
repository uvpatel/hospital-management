import { findUsers, findRoles, findAuditLogs, findHospitalSettings, getOperationalSummary } from '@/db/queries/admin';
import { logAudit } from '@/lib/audit';

export async function getUsersService() {
  return await findUsers();
}

export async function getRolesService() {
  return await findRoles();
}

export async function getAuditLogsService() {
  return await findAuditLogs();
}

export async function getHospitalSettingsService() {
  return await findHospitalSettings();
}

export async function getOperationalSummaryService() {
  return await getOperationalSummary();
}
