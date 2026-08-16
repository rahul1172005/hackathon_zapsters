"""Realtime transport endpoints for live judging.

``GET /sse/{hackathon_id}`` streams judge/evaluation events as Server-Sent
Events and is the primary transport — a plain HTTP GET, so it passes through
the Next.js ``/api/*`` rewrite without WebSocket support in the proxy layer.

``WS /ws/{hackathon_id}`` is a WebSocket endpoint for low-latency judge
dashboards. It accepts the connection, joins the hackathon's room, and stays
open for client pings while the hub pushes events down the socket.

Both endpoints subscribe a per-connection transport to the room in
``app.core.ws``; every event published there (via ``publish_event``) is
fanned out to all live subscribers.
"""

from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

from app.core.ws import QueueSubscriber, WebSocketSubscriber, hub, new_event

router = APIRouter(tags=["realtime"])

SSE_KEEPALIVE_INTERVAL_SECONDS = 15
SSE_HEARTBEAT = ": keepalive\n\n"


@router.websocket("/ws/{hackathon_id}")
async def websocket_endpoint(websocket: WebSocket, hackathon_id: str) -> None:
    await websocket.accept()
    transport = WebSocketSubscriber(websocket)
    await hub.subscribe(hackathon_id, transport)
    try:
        connected = new_event("realtime.connected", hackathon_id)
        await transport.send_json(connected.model_dump(mode="json"))
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        await hub.unsubscribe(hackathon_id, transport)


@router.get("/sse/{hackathon_id}")
async def sse_endpoint(hackathon_id: str, request: Request) -> StreamingResponse:
    queue: asyncio.Queue[dict] = asyncio.Queue(maxsize=100)
    transport = QueueSubscriber(queue)
    await hub.subscribe(hackathon_id, transport)

    async def event_stream():
        try:
            connected = new_event("realtime.connected", hackathon_id)
            yield _sse_format(connected.model_dump(mode="json"))
            while True:
                try:
                    message = await asyncio.wait_for(queue.get(), timeout=SSE_KEEPALIVE_INTERVAL_SECONDS)
                except TimeoutError:
                    if await request.is_disconnected():
                        break
                    yield SSE_HEARTBEAT
                    continue
                yield _sse_format(message)
        finally:
            await hub.unsubscribe(hackathon_id, transport)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def _sse_format(message: dict) -> str:
    return f"id: {message['event_id']}\ndata: {json.dumps(message)}\n\n"
