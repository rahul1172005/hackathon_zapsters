'use client';

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AppRole,
  AuthUser,
  ProfileUpdatePayload,
  RegisterPayload,
  Session,
} from './types';
import { authApi, AuthApiError, isBackendDown } from './client';
import { demoLogin, demoRegister, demoUpdateProfile } from './demo';
import { primaryRole } from './roles';
import { clearSession, loadStoredSession, persistSession } from './store';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  role: AppRole | null;
  mode: 'live' | 'demo' | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<AuthUser>;
  selectRole: (role: AppRole) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window === 'undefined') return null;
    return loadStoredSession();
  });
  const [status, setStatus] = useState<AuthStatus>(() => {
    if (typeof window === 'undefined') return 'loading';
    const stored = loadStoredSession();
    return stored ? 'authenticated' : 'unauthenticated';
  });

  useEffect(() => {
    let cancelled = false;

    // Immediately ensure state matches stored session if hydrated
    const stored = loadStoredSession();
    if (stored && !session) {
      setSession(stored);
      setStatus('authenticated');
    }

    async function revalidate() {
      try {
        const live = await authApi.refresh();
        if (!cancelled && live?.user) {
          const next: Session = { user: live.user, accessToken: live.access_token, mode: 'live' };
          setSession(next);
          setStatus('authenticated');
          persistSession(next);
        }
      } catch {
        // Backend unreachable or no refresh cookie: stored session remains active
        if (!cancelled) {
          const fallback = loadStoredSession();
          if (fallback) {
            setSession({ ...fallback, accessToken: null });
            setStatus('authenticated');
          } else {
            setStatus('unauthenticated');
          }
        }
      }
    }

    void revalidate();
    return () => {
      cancelled = true;
    };
  }, []);

  const setAuthenticated = useCallback(
    (user: AuthUser, accessToken: string | null, mode: Session['mode']): AuthUser => {
      const next: Session = { user, accessToken, mode };
      setSession(next);
      setStatus('authenticated');
      persistSession(next);
      return user;
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      try {
        const res = await authApi.login({ email, password });
        return setAuthenticated(res.user, res.access_token, 'live');
      } catch (error) {
        if (isBackendDown(error)) {
          const res = await demoLogin({ email, password });
          return setAuthenticated(res.user, res.access_token, 'demo');
        }
        throw error;
      }
    },
    [setAuthenticated],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<AuthUser> => {
      try {
        const res = await authApi.register(payload);
        return setAuthenticated(res.user, res.access_token, 'live');
      } catch (error) {
        if (isBackendDown(error)) {
          const res = await demoRegister(payload);
          return setAuthenticated(res.user, res.access_token, 'demo');
        }
        throw error;
      }
    },
    [setAuthenticated],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort: the local session is cleared regardless of network state.
    }
    clearSession();
    setSession(null);
    setStatus('unauthenticated');
  }, []);

  const updateProfile = useCallback(
    async (payload: ProfileUpdatePayload): Promise<AuthUser> => {
      if (!session) throw new AuthApiError(401, 'Not authenticated');
      try {
        const user = await authApi.updateProfile(payload);
        return setAuthenticated(user, session.accessToken, 'live');
      } catch (error) {
        if (isBackendDown(error)) {
          const user = await demoUpdateProfile(session.user, payload);
          return setAuthenticated(user, session.accessToken, session.mode);
        }
        throw error;
      }
    },
    [session, setAuthenticated],
  );

  const selectRole = useCallback(
    (role: AppRole) => {
      if (!session) return;
      const roles = Array.from(new Set([...session.user.roles, role.toLowerCase()]));
      const next: Session = { ...session, user: { ...session.user, roles } };
      setSession(next);
      persistSession(next);
    },
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      status,
      role: session ? primaryRole(session.user) : null,
      mode: session?.mode ?? null,
      login,
      register,
      logout,
      updateProfile,
      selectRole,
    }),
    [session, status, login, register, logout, updateProfile, selectRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
