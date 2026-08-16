import type { AppRole, AuthMode, AuthUser, Session } from './types';
import { DEFAULT_AVATAR, primaryRole } from './roles';

const AUTH_FLAG_KEY = 'zapsters_auth';
const LEGACY_USER_KEY = 'zapsters_user';
const SESSION_KEY = 'zapsters_session';

interface LegacyUser {
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  handle?: string;
}

function toLegacyUser(user: AuthUser, role: AppRole): LegacyUser {
  return {
    name: user.name,
    email: user.email,
    role,
    avatar: user.avatar ?? DEFAULT_AVATAR,
    handle: user.username ?? user.email.split('@')[0] ?? 'user',
  };
}

export function persistLegacy(user: AuthUser, role: AppRole): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_FLAG_KEY, 'true');
  localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(toLegacyUser(user, role)));
  document.cookie = `${AUTH_FLAG_KEY}=true; path=/; max-age=604800; SameSite=Lax`;
  document.cookie = `zapsters_refresh=demo-refresh; path=/; max-age=604800; SameSite=Lax`;
  window.dispatchEvent(new Event('storage'));
}

export function persistSession(session: Session): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user: session.user, mode: session.mode }));
  persistLegacy(session.user, primaryRole(session.user));
  document.cookie = `${SESSION_KEY}=${encodeURIComponent(JSON.stringify({ user: session.user, mode: session.mode }))}; path=/; max-age=604800; SameSite=Lax`;
}

export function loadStoredSession(): Session | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { user?: AuthUser; mode?: AuthMode };
      if (parsed?.user?.id) {
        return { user: parsed.user, accessToken: null, mode: parsed.mode ?? 'demo' };
      }
    } catch {
      // fall through to legacy keys
    }
  }

  const rawLegacy = localStorage.getItem(LEGACY_USER_KEY);
  if (rawLegacy) {
    try {
      const legacy = JSON.parse(rawLegacy) as LegacyUser;
      if (legacy?.email) {
        const role = (legacy.role ?? 'Participant').toLowerCase();
        const user: AuthUser = {
          id: `legacy-${legacy.email}`,
          email: legacy.email,
          username: legacy.handle ?? legacy.email.split('@')[0] ?? 'user',
          name: legacy.name ?? 'User',
          title: null,
          bio: null,
          avatar: legacy.avatar ?? null,
          github_handle: legacy.handle ?? null,
          linkedin_url: null,
          roles: [role],
          skills: [],
          is_verified: true,
          created_at: new Date().toISOString(),
        };
        return { user, accessToken: null, mode: 'demo' };
      }
    } catch {
      // ignore malformed legacy user
    }
  }

  return null;
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_FLAG_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(SESSION_KEY);
  document.cookie = `${AUTH_FLAG_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  document.cookie = `zapsters_refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  window.dispatchEvent(new Event('storage'));
}
