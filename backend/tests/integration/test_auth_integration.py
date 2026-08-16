"""Integration tests: full HTTP -> route -> service -> real Postgres (SOP §12).

Uses a real throwaway Postgres database (``zapsters_test``) with SAVEPOINT row
isolation and fakeredis for the token denylist.
"""

import pytest
from httpx import AsyncClient

REGISTER = {
    "email": "new@example.com",
    "username": "newuser",
    "name": "New User",
    "password": "correct-horse-battery-staple",
}


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient) -> None:
    resp = await client.post("/api/v1/auth/register", json=REGISTER)
    assert resp.status_code == 201
    body = resp.json()
    assert body["access_token"]
    assert body["user"]["email"] == REGISTER["email"]
    assert body["user"]["username"] == REGISTER["username"]
    assert "password" not in body["user"]
    assert "hashed_password" not in body["user"]
    assert "zapsters_refresh" in resp.cookies


@pytest.mark.asyncio
async def test_register_duplicate_email_conflicts(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTER)
    dup = dict(REGISTER, username="different")
    resp = await client.post("/api/v1/auth/register", json=dup)
    assert resp.status_code == 409
    assert resp.json()["error"]["code"] == "conflict"


@pytest.mark.asyncio
async def test_register_duplicate_username_conflicts(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTER)
    dup = dict(REGISTER, email="other@example.com")
    resp = await client.post("/api/v1/auth/register", json=dup)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_register_invalid_payload_rejected(client: AsyncClient) -> None:
    resp = await client.post("/api/v1/auth/register", json={"email": "not-an-email", "password": "short"})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTER)
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": REGISTER["email"], "password": REGISTER["password"]},
    )
    assert resp.status_code == 200
    assert resp.json()["access_token"]


@pytest.mark.asyncio
async def test_login_wrong_password_rejected(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTER)
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": REGISTER["email"], "password": "wrong-password-here"},
    )
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "invalid_credentials"


@pytest.mark.asyncio
async def test_login_unknown_email_rejected(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "whatever-pass-123"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_requires_auth(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_returns_current_user(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTER)
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": REGISTER["email"], "password": REGISTER["password"]},
    )
    token = login.json()["access_token"]
    resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == REGISTER["email"]
    assert resp.json()["username"] == REGISTER["username"]


@pytest.mark.asyncio
async def test_me_rejects_garbage_token(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not.a.token"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_refresh_rotates_token(client: AsyncClient) -> None:
    register = await client.post("/api/v1/auth/register", json=REGISTER)
    refresh_token = register.cookies.get("zapsters_refresh")
    assert refresh_token

    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    new_refresh = resp.cookies.get("zapsters_refresh")
    assert new_refresh and new_refresh != refresh_token


@pytest.mark.asyncio
async def test_refresh_denylisted_token_rejected(client: AsyncClient) -> None:
    register = await client.post("/api/v1/auth/register", json=REGISTER)
    refresh_token = register.cookies.get("zapsters_refresh")
    # First refresh rotates (denylists) the presented token.
    await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    # Replaying the old token must now fail.
    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_public_profile_lookup(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTER)
    resp = await client.get(f"/api/v1/users/{REGISTER['username']}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["username"] == REGISTER["username"]
    assert "hashed_password" not in body


@pytest.mark.asyncio
async def test_public_profile_missing_returns_404(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/users/doesnotexist")
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "not_found"


@pytest.mark.asyncio
async def test_update_profile_requires_auth(client: AsyncClient) -> None:
    resp = await client.patch("/api/v1/users/me", json={"name": "Hacked"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_update_profile_success(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTER)
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": REGISTER["email"], "password": REGISTER["password"]},
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.patch("/api/v1/users/me", json={"name": "Updated Name", "title": "Builder"}, headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Updated Name"
    assert body["title"] == "Builder"
    assert "hashed_password" not in body
