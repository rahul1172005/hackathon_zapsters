import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export class AuthApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'AuthApiError';
    this.status = status;
    this.detail = detail;
  }
}

export function isBackendDown(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) return true;
  if (error instanceof AuthApiError) {
    if (
      error.status === 0 ||
      error.status === 404 ||
      error.status === 405 ||
      error.status === 502 ||
      error.status === 503 ||
      error.status === 504 ||
      error.status >= 500
    ) {
      return true;
    }
  }
  return false;
}

interface JsonErrorBody {
  detail?: string | Array<{ msg?: string }> | undefined;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = 1200;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: init.signal || controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as JsonErrorBody;
      if (typeof body.detail === 'string') {
        detail = body.detail;
      } else if (Array.isArray(body.detail) && body.detail.length > 0) {
        detail = body.detail
          .map((item) => item?.msg ?? 'Invalid request')
          .join('; ');
      }
    } catch {
      // non-JSON error body — keep the default message
    }
    throw new AuthApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const authApi = {
  login(payload: LoginPayload) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  register(payload: RegisterPayload) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  refresh() {
    return request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  logout() {
    return request<void>('/auth/logout', { method: 'POST' });
  },

  me() {
    return request<AuthUser>('/auth/me');
  },

  updateProfile(payload: ProfileUpdatePayload) {
    return request<AuthUser>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
