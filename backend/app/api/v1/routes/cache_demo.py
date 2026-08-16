"""Demo endpoints exercising the Redis cache helpers (Phase 5).

The ``@cached`` decorator and the typed ``cache_get_json``/``cache_set_json``
helpers are demonstrated here so no existing service or route needs to change.
Wire this ``router`` into ``api/v1/router.py`` (owned by the router owner) to
expose the endpoints under ``/api/v1``.
"""

import asyncio
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Response

from app.api.deps import CurrentUser
from app.core.cache import (
    cache_delete_prefix,
    cache_get,
    cache_get_json,
    cache_set_json,
    cached,
)

router = APIRouter(prefix="/cache-demo", tags=["cache-demo"])


@cached(ttl=60, key="greeting")
async def _greeting() -> str:
    await asyncio.sleep(0.5)
    return "Hello from the cache demo"


@router.get("/greeting", summary="Value cached with @cached (60s TTL)")
async def get_greeting(response: Response) -> dict[str, str]:
    hit = (await cache_get("cache:greeting")) is not None
    response.headers["X-Cache"] = "HIT" if hit else "MISS"
    return {"message": await _greeting()}


@router.get("/stats", summary="Typed JSON cache get/set (120s TTL)")
async def get_stats(response: Response) -> dict[str, Any]:
    key = "cache:demo-stats"
    stats = await cache_get_json(key, dict)
    if stats is None:
        stats = {"teams": 42, "evaluations": 128, "generated_at": datetime.now(UTC).isoformat()}
        await cache_set_json(key, stats, ttl=120)
        response.headers["X-Cache"] = "MISS"
    else:
        response.headers["X-Cache"] = "HIT"
    return stats


@router.post("/invalidate", summary="Tag-style invalidation: drop all cache:* keys")
async def invalidate_cache(current_user: CurrentUser) -> dict[str, int]:
    deleted = await cache_delete_prefix("cache")
    return {"deleted_keys": deleted}
