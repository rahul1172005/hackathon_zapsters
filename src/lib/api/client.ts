import type { ApiErrorBody } from '@/types';

/**
 * Base path for the FastAPI backend. Next.js `rewrites` proxy /api/v1/* to the
 * backend in development, so all requests stay same-origin relative to the app.
 */
export const API_BASE_URL = '/api/v1';

/**
 * Typed error thrown by the API client. `status` is 0 for network-level
 * failures (unreachable backend) and the HTTP status otherwise; `code` is the
 * backend error code (e.g. `not_found`, `validation_error`) or a client-side
 * code such as `network_error` / `malformed_payload`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, status = 0, code = 'api_error', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

let authToken: string | null = null;

/** Set the bearer token used for authenticated requests (auth wiring). */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

function resolveAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('zapsters_token');
}

function buildQuery(query?: ApiRequestOptions['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

let backendOfflineUntil = 0;

export function isBackendOffline(): boolean {
  return Date.now() < backendOfflineUntil;
}

export function markBackendOffline(cooldownMs: number = 15000): void {
  backendOfflineUntil = Date.now() + cooldownMs;
}

export function resetBackendOffline(): void {
  backendOfflineUntil = 0;
}

/**
 * Minimal fetch wrapper: builds the /api/v1 URL, serializes JSON bodies,
 * attaches the auth token, parses JSON responses and normalizes failures into
 * typed {@link ApiError} instances.
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (isBackendOffline()) {
    throw new ApiError('Backend is offline (circuit breaker open)', 0, 'network_error');
  }

  const { method = 'GET', query, body, headers, signal } = options;
  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };
  const token = resolveAuthToken();
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  // Fast 600ms timeout for local / api requests
  const timeoutId = setTimeout(() => controller.abort(), 600);

  const init: RequestInit = {
    method,
    headers: requestHeaders,
    signal: signal || controller.signal,
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url, init);
    // If successful, ensure circuit breaker is reset
    resetBackendOffline();
  } catch (err) {
    markBackendOffline();
    const message = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(`Network error while calling ${method} ${url}: ${message}`, 0, 'network_error');
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await parseBody(res);

  if (!res.ok) {
    const payload = typeof data === 'object' && data !== null ? (data as ApiErrorBody) : {};
    const message =
      payload.error?.message ??
      (typeof payload.detail === 'string' && payload.detail ? payload.detail : null) ??
      (typeof data === 'string' && data ? data : null) ??
      `Request to ${url} failed with status ${res.status}`;
    throw new ApiError(String(message), res.status, payload.error?.code ?? 'request_failed', data);
  }

  return data as T;
}
