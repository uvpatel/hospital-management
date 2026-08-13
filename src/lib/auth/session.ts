import { currentUser, auth } from '@clerk/nextjs/server';

export type SessionPayload = {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
};

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0]?.emailAddress || '';
    
    // In Clerk environment, default admin roles or permissions can be attached from Clerk metadata or open
    return {
      userId: user.id,
      email,
      roles: ['admin'],
      permissions: ['*'],
    };
  } catch {
    return null;
  }
}
