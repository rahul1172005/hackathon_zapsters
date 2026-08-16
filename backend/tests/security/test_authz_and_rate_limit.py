"""Security tests: authorization boundaries, rate limiting, token validation.

Mapped to SOP §7-9. Tests exercise routes that actually exist (§8.5), never a
non-existent endpoint asserting "403 or 404 for the wrong reason".
"""

import pytest
from httpx import AsyncClient
from pyrate_limiter import Duration, InMemoryBucket, Limiter, Rate

from app.core.constants import AUTH_RATE_LIMIT
from app.main import app
from tests.integration.test_auth_integration import REGISTER

OWNER = dict(REGISTER, username="owner", email="owner@example.com")
INTRUDER = dict(REGISTER, username="intruder", email="intruder@example.com")
HACKATHON_PAYLOAD = {"slug": "quantum-build-2026", "title": "Quantum Build 2026", "status": "UPCOMING"}


async def _register_and_get_token(client: AsyncClient, payload: dict) -> str:
    await client.post("/api/v1/auth/register", json=payload)
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    return login.json()["access_token"]


async def _create_hackathon(client: AsyncClient, token: str) -> str:
    resp = await client.post("/api/v1/hackathons", json=HACKATHON_PAYLOAD, headers={"Authorization": f"Bearer {token}"})
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_non_owner_cannot_update_hackathon(client: AsyncClient) -> None:
    owner_token = await _register_and_get_token(client, OWNER)
    hackathon_id = await _create_hackathon(client, owner_token)
    intruder_token = await _register_and_get_token(client, INTRUDER)

    resp = await client.patch(
        f"/api/v1/hackathons/{hackathon_id}",
        json={"title": "Pwned"},
        headers={"Authorization": f"Bearer {intruder_token}"},
    )
    assert resp.status_code == 403
    assert resp.json()["error"]["code"] == "forbidden"


@pytest.mark.asyncio
async def test_non_owner_cannot_change_status(client: AsyncClient) -> None:
    owner_token = await _register_and_get_token(client, OWNER)
    hackathon_id = await _create_hackathon(client, owner_token)
    intruder_token = await _register_and_get_token(client, INTRUDER)

    resp = await client.post(
        f"/api/v1/hackathons/{hackathon_id}/status?status=COMPLETED",
        headers={"Authorization": f"Bearer {intruder_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_access_endpoint_rejects_refresh_token(client: AsyncClient) -> None:
    """A refresh token is structurally incapable of acting as an access token (§7.1.2)."""
    register = await client.post("/api/v1/auth/register", json=REGISTER)
    refresh_token = register.cookies.get("zapsters_refresh")
    assert refresh_token

    resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {refresh_token}"})
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "invalid_credentials"


@pytest.mark.asyncio
async def test_mass_assignment_rejected(client: AsyncClient) -> None:
    """UserUpdate must not let a caller promote their own role (§8.4)."""
    token = await _register_and_get_token(client, REGISTER)
    resp = await client.patch(
        "/api/v1/users/me",
        json={"name": "Legit", "is_superuser": True, "is_active": False, "roles": ["admin"]},
        headers={"Authorization": f"Bearer {token}"},
    )
    # Unknown fields in the request body are ignored; the response schema has no
    # is_superuser/is_active/roles-mutable surface, so nothing dangerous sticks.
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Legit"
    assert body["roles"] == ["participant"]


@pytest.mark.asyncio
async def test_public_profile_does_not_leak_credentials(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTER)
    resp = await client.get(f"/api/v1/users/{REGISTER['username']}")
    body = resp.json()
    assert "hashed_password" not in body
    assert "is_active" not in body


@pytest.mark.asyncio
async def test_auth_rate_limit_enforced(client: AsyncClient) -> None:
    """Login is protected by the stricter AUTH_RATE_LIMIT (§9.2)."""
    in_memory = InMemoryBucket([Rate(AUTH_RATE_LIMIT.times, Duration.SECOND * AUTH_RATE_LIMIT.seconds)])
    app.state.rate_limiters = {"auth": Limiter(in_memory)}
    try:
        statuses = []
        for _ in range(AUTH_RATE_LIMIT.times + 1):
            resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "bruteforce@example.com", "password": "wrong-password-123"},
            )
            statuses.append(resp.status_code)
        assert statuses[: AUTH_RATE_LIMIT.times] == [401] * AUTH_RATE_LIMIT.times
        assert statuses[-1] == 429
    finally:
        app.state.rate_limiters = None
