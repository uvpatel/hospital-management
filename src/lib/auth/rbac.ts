import { getSession } from './session';

export async function hasPermission(permissionCode: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  // If the user has the 'admin' role, they have all permissions
  if (session.roles.includes('admin')) return true;
  return session.permissions.includes(permissionCode);
}

export async function requirePermission(permissionCode: string) {
  const authorized = await hasPermission(permissionCode);
  if (!authorized) {
    throw new Error(`Unauthorized. Requires permission: ${permissionCode}`);
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthenticated');
  }
  return session;
}
