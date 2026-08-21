import type { AppRole, AuthUser } from './types';

export const DEFAULT_AVATAR = '';

export function primaryRole(user: Pick<AuthUser, 'roles'>): AppRole {
  const roles = (user.roles ?? []).map((role) => role.toLowerCase());
  if (roles.includes('organizer') || roles.includes('admin')) return 'Organizer';
  if (roles.includes('judge')) return 'Judge';
  return 'Participant';
}

export function roleFromEmail(email: string): AppRole {
  const normalized = email.toLowerCase();
  if (normalized.includes('admin')) return 'Organizer';
  if (normalized.includes('judge')) return 'Judge';
  return 'Participant';
}

export function routeForRole(role: AppRole): string {
  if (role === 'Organizer') return '/organizer/quantum-build-2026/overview';
  if (role === 'Judge') return '/judge/dashboard';
  return '/dashboard';
}
