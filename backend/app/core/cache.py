"""Async Redis cache helpers with typed get/set and a ``@cached`` decorator.

Every helper fails open: a degraded Redis backend is logged and treated as a
cache miss rather than raising, so caching never takes down a request. This
deliberately inverts the failure mode of ``redis_client.is_token_denylisted``,
which must fail closed for security (SOP §7.2) — a cache has no such
correctness obligation.
"""

from __future__ import annotations

import json
from collections.abc import Awaitable, Callable
from functools import wraps
from inspect import iscoroutinefunction, signature
from typing import Any

import structlog

from app.core.redis_client import redis_client

logger = structlog.get_logger(__name__)

CACHE_PREFIX = "cache"


async def cache_get(key: str) -> str | None:
    """Return the raw string value for ``key``, or ``None`` on a miss/error."""
    try:
        return await redis_client.get(key)
    except Exception:
        logger.warning("cache_get_failed", key=key)
        return None


async def cache_set(key: str, value: str, ttl: int) -> None:
    """Store ``value`` under ``key`` for ``ttl`` seconds."""
    try:
        await redis_client.set(key, value, ex=ttl)
    except Exception:
        logger.warning("cache_set_failed", key=key)


async def cache_delete(key: str) -> bool:
    """Delete ``key``; returns ``True`` when a value existed."""
    try:
        return bool(await redis_client.delete(key))
    except Exception:
        logger.warning("cache_delete_failed", key=key)
        return False


async def cache_delete_prefix(prefix: str) -> int:
    """Delete every key under ``prefix:*`` (tag-style revalidation).

    Returns the number of keys removed. Uses ``SCAN`` so a large key space
    never blocks Redis the way ``KEYS`` would.
    """
    try:
        keys = [key async for key in redis_client.scan_iter(match=f"{prefix}:*")]
        if keys:
            return int(await redis_client.delete(*keys))
        return 0
    except Exception:
        logger.warning("cache_delete_prefix_failed", prefix=prefix)
        return 0


async def cache_get_json[T](key: str, model: type[T]) -> T | None:
    """Fetch ``key`` and deserialize the JSON payload typed as ``model``.

    ``model`` may be a plain type (``dict``, ``list``, ``int``, ...) or a
    Pydantic model, which is validated when the payload is a dict or list.
    Corrupt payloads are evicted and reported as a miss.
    """
    raw = await cache_get(key)
    if raw is None:
        return None
    try:
        data = json.loads(raw)
        if hasattr(model, "model_validate") and isinstance(data, (dict, list)):
            return model.model_validate(data)
        return data
    except Exception:
        logger.warning("cache_deserialize_failed", key=key)
        await cache_delete(key)
        return None


async def cache_set_json(key: str, value: Any, ttl: int) -> None:
    """Serialize ``value`` to JSON and store it under ``key`` for ``ttl`` seconds."""
    await cache_set(key, json.dumps(value, default=str), ttl)


def cached[T, **P](
    ttl: int,
    *,
    prefix: str = CACHE_PREFIX,
    key: str | None = None,
    key_builder: Callable[..., str] | None = None,
    loader: Callable[[str], T] | None = None,
    dumper: Callable[[T], str] | None = None,
) -> Callable[[Callable[P, Awaitable[T]]], Callable[P, Awaitable[T]]]:
    """Cache the result of an async function for ``ttl`` seconds.

    The cache key is ``{prefix}:{key}`` when ``key`` is given, otherwise
    ``{prefix}:{module}.{qualname}:{json(args, kwargs)}``. ``self``/``cls`` are
    excluded from the default key, but arguments that are not stable across
    calls (sessions, request objects) should be paired with an explicit ``key``
    or ``key_builder``. On any Redis error the wrapped function is called and
    the value is served uncached (fail open). Only ``async def`` functions may
    be decorated.
    """
    if not ttl or ttl < 1:
        raise ValueError("cached() requires ttl >= 1 second")

    def decorator(func: Callable[P, Awaitable[T]]) -> Callable[P, Awaitable[T]]:
        if not iscoroutinefunction(func):
            raise TypeError("@cached can only decorate async functions")
        qualname = f"{func.__module__}.{func.__qualname__}"

        def build_key(args: tuple[Any, ...], kwargs: dict[str, Any]) -> str:
            if key_builder is not None:
                return f"{prefix}:{key_builder(*args, **kwargs)}"
            if key is not None:
                return f"{prefix}:{key}"
            params = list(signature(func).parameters.values())
            positional = args
            if params and params[0].name in {"self", "cls"} and positional:
                positional = positional[1:]
            payload = json.dumps({"args": list(positional), "kwargs": kwargs}, sort_keys=True, default=str)
            return f"{prefix}:{qualname}:{payload}"

        @wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            cache_key = build_key(args, kwargs)
            raw = await cache_get(cache_key)
            if raw is not None:
                try:
                    return loader(raw) if loader is not None else json.loads(raw)
                except Exception:
                    logger.warning("cache_decorator_deserialize_failed", key=cache_key)
            result = await func(*args, **kwargs)
            serialized = dumper(result) if dumper is not None else json.dumps(result, default=str)
            await cache_set(cache_key, serialized, ttl)
            return result

        return wrapper

    return decorator
