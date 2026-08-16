// Incremental static regeneration helpers (Next.js App Router, v16).
// Standalone: import what you need from server components or client code.
// Server-only functions use a lazy `import('next/cache')` so this module can
// also be safely imported from client code without pulling server APIs in.

export const LEADERBOARD_CACHE_TAG = 'leaderboard';

export interface CachedFetchOptions extends RequestInit {
  /** Cache lifetime in seconds (or `false` to cache indefinitely). */
  revalidate?: number | false;
  /** Cache tags for on-demand revalidation via `revalidateCache`. */
  tags?: string[];
}

export class FetchCacheError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'FetchCacheError';
  }
}

/** Server-side fetch with Next.js `next: { revalidate, tags }` semantics. */
export async function cachedFetch<T>(
  url: string,
  options: CachedFetchOptions = {},
): Promise<T> {
  const { revalidate = 60, tags, ...init } = options;
  const response = await fetch(url, {
    ...init,
    next: {
      revalidate,
      ...(tags && tags.length > 0 ? { tags } : {}),
    },
  });

  if (!response.ok) {
    throw new FetchCacheError(
      `cachedFetch failed: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export type RevalidateProfile = 'max' | { expire?: number };

/**
 * Server-only tag revalidation (Server Actions / Route Handlers).
 * Next.js 16 requires the second argument; `'max'` gives stale-while-revalidate
 * and `{ expire: 0 }` gives immediate expiration.
 */
export async function revalidateCache(
  tag: string,
  profile: RevalidateProfile = 'max',
): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(tag, profile);
}

export const REVALIDATE_ENDPOINT = '/api/revalidate';

/**
 * Client-safe tag revalidation: posts to a revalidation route handler that
 * calls `revalidateCache`. Returns `true` when the server acknowledged.
 */
export async function revalidateCacheOnClient(
  tag: string,
  endpoint: string = REVALIDATE_ENDPOINT,
): Promise<boolean> {
  try {
    const response = await fetch(`${endpoint}?tag=${encodeURIComponent(tag)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}
