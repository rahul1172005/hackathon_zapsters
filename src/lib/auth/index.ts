export { AuthProvider, AuthContext } from './provider';
export type { AuthContextValue, AuthStatus } from './provider';
export { useAuth } from './use-auth';
export { authApi, AuthApiError, isBackendDown } from './client';
export { primaryRole, roleFromEmail, routeForRole, DEFAULT_AVATAR } from './roles';
export { clearSession, loadStoredSession, persistLegacy, persistSession } from './store';
export type {
  AppRole,
  AuthMode,
  AuthResponse,
  AuthUser,
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  Session,
} from './types';
