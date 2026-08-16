from redis.asyncio import Redis, from_url

from app.core.config import settings

redis_client: Redis = from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
)


async def is_token_denylisted(jti: str) -> bool:
    """Return True if the token jti is denylisted.

    Fails closed: any Redis error is treated as a denylisted token so a
    degraded cache never trusts a token it cannot verify (SOP §7.2).
    """
    try:
        return bool(await redis_client.get(f"denylist:{jti}"))
    except Exception:
        return True


async def revoke_token(jti: str, ttl_seconds: int) -> None:
    await redis_client.set(f"denylist:{jti}", "1", ex=ttl_seconds)
