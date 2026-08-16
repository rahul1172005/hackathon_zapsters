"""Realtime hub for live judging.

Fans out judge/evaluation events to per-hackathon rooms of subscribers
(WebSocket and SSE transports). In a multi-worker deployment the same events
are forwarded over Redis pub/sub so every worker delivers to its own local
subscribers; when Redis is unreachable the hub degrades to an in-process
asyncio broadcast (matching the fail-open posture of ``app.core.cache``).

Event envelope::

    {
        "event_id": "uuid4",
        "type": "evaluation.submitted" | "evaluation.scored"
              | "submission.submitted" | "realtime.connected" | "realtime.ping",
        "hackathon_id": "...",
        "timestamp": "ISO-8601 UTC",
        "payload": {...}
    }

Any service can emit an event with the module-level ``publish_event`` helper,
for example from the evaluation service when an evaluation is saved::

    await publish_event(
        str(evaluation.hackathon_id),
        "evaluation.scored",
        {"team_id": str(evaluation.team_id), "total_score": evaluation.total_score},
    )
"""

from __future__ import annotations

import asyncio
import contextlib
import json
import uuid
from collections import defaultdict
from datetime import UTC, datetime
from typing import Any, Literal, Protocol

import structlog
from pydantic import BaseModel, Field

from app.core.redis_client import redis_client

logger = structlog.get_logger(__name__)

REDIS_CHANNEL_PREFIX = "hackathon"
REDIS_CHANNEL_SUFFIX = "events"


def _channel(hackathon_id: str) -> str:
    return f"{REDIS_CHANNEL_PREFIX}:{hackathon_id}:{REDIS_CHANNEL_SUFFIX}"


def _hackathon_id_from_channel(channel: str) -> str | None:
    parts = channel.split(":")
    if len(parts) == 3 and parts[0] == REDIS_CHANNEL_PREFIX and parts[2] == REDIS_CHANNEL_SUFFIX:
        return parts[1]
    return None


EventType = Literal[
    "evaluation.submitted",
    "evaluation.scored",
    "submission.submitted",
    "realtime.connected",
    "realtime.ping",
]


class RealtimeEvent(BaseModel):
    """The wire envelope for every event the hub delivers."""

    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: EventType
    hackathon_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    payload: dict[str, Any] = Field(default_factory=dict)


class Subscriber(Protocol):
    """Anything that can receive a serialized event (a WebSocket or an SSE queue)."""

    async def send_json(self, message: dict) -> None: ...


class WebSocketSubscriber:
    """Fan-out target backed by a connected FastAPI ``WebSocket``."""

    def __init__(self, websocket: Any) -> None:
        self._websocket = websocket

    async def send_json(self, message: dict) -> None:
        await self._websocket.send_json(message)


class QueueSubscriber:
    """Fan-out target backed by an ``asyncio.Queue`` drained by an SSE stream.

    A full queue drops the frame rather than blocking the room (a slow SSE
    client must not stall every other subscriber).
    """

    def __init__(self, queue: asyncio.Queue[dict]) -> None:
        self._queue = queue

    async def send_json(self, message: dict) -> None:
        try:
            self._queue.put_nowait(message)
        except asyncio.QueueFull:
            logger.warning("realtime_sse_queue_full", event_type=message.get("type"))


class RealtimeHub:
    """Per-hackathon rooms of subscribers with cross-worker Redis fan-out.

    Not instantiated directly by routes; use the module-level ``hub``.
    """

    def __init__(self) -> None:
        self._rooms: dict[str, set[Subscriber]] = defaultdict(set)
        self._lock = asyncio.Lock()
        self._redis_listener: asyncio.Task | None = None
        self._redis_available: bool | None = None
        self._worker_id = str(uuid.uuid4())

    @property
    def worker_id(self) -> str:
        return self._worker_id

    async def subscribe(self, hackathon_id: str, subscriber: Subscriber) -> None:
        async with self._lock:
            self._rooms[hackathon_id].add(subscriber)
        await self._ensure_redis_listener()
        logger.debug("realtime_subscribed", hackathon_id=hackathon_id)

    async def unsubscribe(self, hackathon_id: str, subscriber: Subscriber) -> None:
        async with self._lock:
            room = self._rooms.get(hackathon_id)
            if room is None:
                return
            room.discard(subscriber)
            if not room:
                self._rooms.pop(hackathon_id, None)

    async def publish(self, hackathon_id: str, event: RealtimeEvent) -> None:
        """Deliver ``event`` to the room, then forward it to other workers."""
        message = event.model_dump(mode="json")
        await self._deliver(hackathon_id, message)
        await self._redis_publish(hackathon_id, message)

    async def close(self) -> None:
        """Cancel the Redis listener; call once at process shutdown."""
        if self._redis_listener is not None and not self._redis_listener.done():
            self._redis_listener.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._redis_listener

    async def _deliver(self, hackathon_id: str, message: dict) -> None:
        async with self._lock:
            subscribers = list(self._rooms.get(hackathon_id, ()))
        for subscriber in subscribers:
            try:
                await subscriber.send_json(message)
            except Exception:
                logger.warning(
                    "realtime_delivery_failed",
                    hackathon_id=hackathon_id,
                    event_type=message.get("type"),
                )
                await self.unsubscribe(hackathon_id, subscriber)

    async def _redis_publish(self, hackathon_id: str, message: dict) -> None:
        if self._redis_available is False:
            return
        try:
            body = json.dumps({**message, "_worker_id": self._worker_id})
            await redis_client.publish(_channel(hackathon_id), body)
        except Exception:
            self._redis_available = False
            logger.warning("realtime_redis_unavailable", hackathon_id=hackathon_id)

    async def _ensure_redis_listener(self) -> None:
        if self._redis_listener is None or self._redis_listener.done():
            self._redis_listener = asyncio.create_task(self._redis_listen_loop())

    async def _redis_listen_loop(self) -> None:
        backoff = 1.0
        while True:
            try:
                pubsub = redis_client.pubsub()
                await pubsub.psubscribe(f"{REDIS_CHANNEL_PREFIX}:*:{REDIS_CHANNEL_SUFFIX}")
                self._redis_available = True
                logger.info("realtime_redis_listener_started", worker_id=self._worker_id)
                backoff = 1.0
                async for message in pubsub.listen():
                    if message.get("type") == "pmessage":
                        await self._handle_redis_message(message.get("channel", ""), message.get("data"))
            except asyncio.CancelledError:
                raise
            except Exception:
                self._redis_available = False
                logger.warning("realtime_redis_listener_retry", backoff=backoff)
                await asyncio.sleep(backoff)
                backoff = min(backoff * 2, 30.0)

    async def _handle_redis_message(self, channel: str, data: Any) -> None:
        try:
            message = json.loads(data)
        except (TypeError, json.JSONDecodeError):
            return
        if not isinstance(message, dict) or message.get("_worker_id") == self._worker_id:
            return
        hackathon_id = _hackathon_id_from_channel(channel)
        if hackathon_id is None:
            return
        message.pop("_worker_id", None)
        await self._deliver(hackathon_id, message)


hub = RealtimeHub()


def new_event(event_type: EventType, hackathon_id: str, payload: dict[str, Any] | None = None) -> RealtimeEvent:
    """Build an envelope for ``event_type`` scoped to ``hackathon_id``."""
    return RealtimeEvent(type=event_type, hackathon_id=hackathon_id, payload=payload or {})


async def publish_event(
    hackathon_id: str, event_type: EventType, payload: dict[str, Any] | None = None
) -> RealtimeEvent:
    """Publish a judging event to the hackathon's room (and other workers)."""
    event = new_event(event_type, hackathon_id, payload)
    await hub.publish(hackathon_id, event)
    return event
