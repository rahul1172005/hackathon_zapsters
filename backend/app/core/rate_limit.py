from fastapi import Request, Response
from pyrate_limiter import Duration, Limiter, Rate, RedisBucket

from app.core.constants import AUTH_RATE_LIMIT, PUBLIC_RATE_LIMIT, RateLimit
from app.core.exceptions import RateLimitedError
from app.core.redis_client import redis_client


async def _build_limiter(rule: RateLimit, key: str) -> Limiter:
    rate = Rate(rule.times, Duration.SECOND * rule.seconds)
    bucket = await RedisBucket.init([rate], redis_client, bucket_key=f"ratelimit:{key}")
    return Limiter(bucket)


async def build_rate_limiters() -> dict[str, Limiter]:
    """Build the shared limiters used by route dependencies.

    Called from lifespan so the Redis-backed buckets exist before any request
    arrives. Each limiter gets its own Redis bucket key (SOP §9.1).
    """
    return {
        "auth": await _build_limiter(AUTH_RATE_LIMIT, "auth"),
        "public": await _build_limiter(PUBLIC_RATE_LIMIT, "public"),
    }


class AppRateLimiter:
    """FastAPI dependency that applies a named rate limiter from app state."""

    def __init__(self, key: str) -> None:
        self._key = key

    async def __call__(self, request: Request, response: Response) -> None:
        limiters = getattr(request.app.state, "rate_limiters", None)
        if limiters is None:
            # Rate limiting is wired in lifespan; when it has not run (e.g. some
            # tests) there is no bucket to acquire from, so skip enforcement.
            return
        limiter: Limiter = limiters[self._key]

        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0]
        elif request.client:
            ip = request.client.host
        else:
            ip = "127.0.0.1"
        key = f"{ip}:{self._key}"

        acquired = await limiter.try_acquire_async(key, blocking=False)
        if not acquired:
            raise RateLimitedError()
