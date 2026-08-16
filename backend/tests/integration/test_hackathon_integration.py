"""Integration tests for hackathon lifecycle and object-level authorization."""

import pytest
from httpx import AsyncClient

from tests.integration.test_auth_integration import REGISTER


async def _register_and_login(client: AsyncClient, **overrides) -> tuple[str, str]:
    payload = {**REGISTER, **overrides}
    await client.post("/api/v1/auth/register", json=payload)
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    token = login.json()["access_token"]
    return payload["username"], token


HACKATHON_PAYLOAD = {
    "slug": "quantum-build-2026",
    "title": "Quantum Build 2026",
    "tagline": "AI - CIVIL TECH - ROBOTICS",
    "status": "UPCOMING",
    "is_online": True,
    "prize_pool": "4,00,000",
    "rules": ["Be excellent"],
    "faqs": [{"q": "When?", "a": "Soon"}],
}


@pytest.mark.asyncio
async def test_list_hackathons_empty(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/hackathons")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_hackathon_requires_auth(client: AsyncClient) -> None:
    resp = await client.post("/api/v1/hackathons", json=HACKATHON_PAYLOAD)
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_hackathon_success(client: AsyncClient) -> None:
    _, token = await _register_and_login(client)
    resp = await client.post("/api/v1/hackathons", json=HACKATHON_PAYLOAD, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    body = resp.json()
    assert body["slug"] == HACKATHON_PAYLOAD["slug"]
    assert body["title"] == HACKATHON_PAYLOAD["title"]
    assert body["status"] == "UPCOMING"


@pytest.mark.asyncio
async def test_get_hackathon_by_slug(client: AsyncClient) -> None:
    _, token = await _register_and_login(client)
    await client.post("/api/v1/hackathons", json=HACKATHON_PAYLOAD, headers={"Authorization": f"Bearer {token}"})
    resp = await client.get(f"/api/v1/hackathons/{HACKATHON_PAYLOAD['slug']}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["slug"] == HACKATHON_PAYLOAD["slug"]
    assert body["tracks"] == []
    assert body["prizes"] == []


@pytest.mark.asyncio
async def test_get_missing_hackathon_returns_404(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/hackathons/does-not-exist")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_hackathon_owner_success(client: AsyncClient) -> None:
    _, token = await _register_and_login(client)
    created = await client.post(
        "/api/v1/hackathons", json=HACKATHON_PAYLOAD, headers={"Authorization": f"Bearer {token}"}
    )
    hackathon_id = created.json()["id"]
    resp = await client.patch(
        f"/api/v1/hackathons/{hackathon_id}",
        json={"title": "Quantum Build 2027", "status": "OPEN"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["title"] == "Quantum Build 2027"
    assert body["status"] == "OPEN"


@pytest.mark.asyncio
async def test_update_hackathon_non_owner_forbidden(client: AsyncClient) -> None:
    _, owner_token = await _register_and_login(client, username="owner1", email="owner1@example.com")
    created = await client.post(
        "/api/v1/hackathons", json=HACKATHON_PAYLOAD, headers={"Authorization": f"Bearer {owner_token}"}
    )
    hackathon_id = created.json()["id"]

    _, intruder_token = await _register_and_login(client, username="intruder", email="intruder@example.com")
    resp = await client.patch(
        f"/api/v1/hackathons/{hackathon_id}",
        json={"title": "Hacked"},
        headers={"Authorization": f"Bearer {intruder_token}"},
    )
    assert resp.status_code == 403
    assert resp.json()["error"]["code"] == "forbidden"


@pytest.mark.asyncio
async def test_update_status_non_owner_forbidden(client: AsyncClient) -> None:
    _, owner_token = await _register_and_login(client, username="owner2", email="owner2@example.com")
    created = await client.post(
        "/api/v1/hackathons", json=HACKATHON_PAYLOAD, headers={"Authorization": f"Bearer {owner_token}"}
    )
    hackathon_id = created.json()["id"]

    _, intruder_token = await _register_and_login(client, username="intruder2", email="intruder2@example.com")
    resp = await client.post(
        f"/api/v1/hackathons/{hackathon_id}/status?status=COMPLETED",
        headers={"Authorization": f"Bearer {intruder_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_hackathon_create_rejects_invalid_slug(client: AsyncClient) -> None:
    _, token = await _register_and_login(client)
    payload = dict(HACKATHON_PAYLOAD, slug="Invalid Slug!")
    resp = await client.post("/api/v1/hackathons", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 422
