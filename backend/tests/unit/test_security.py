import time

import jwt as pyjwt
import pytest

from app.core.config import settings
from app.core.exceptions import InvalidCredentialsError, TokenExpiredError
from app.core.security import (
    ACCESS_TOKEN_TYPE,
    REFRESH_TOKEN_TYPE,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hash_round_trip() -> None:
    hashed = hash_password("correct horse battery staple")
    assert hashed != "correct horse battery staple"
    assert verify_password("correct horse battery staple", hashed)


def test_password_verify_rejects_wrong_value() -> None:
    hashed = hash_password("correct horse battery staple")
    assert not verify_password("wrong password", hashed)


@pytest.mark.asyncio
async def test_access_token_round_trip(monkeypatch) -> None:
    async def not_denylisted(jti: str) -> bool:
        return False

    monkeypatch.setattr("app.core.security.is_token_denylisted", not_denylisted)
    token, jti = create_access_token("user-1")
    payload = await decode_token(token, ACCESS_TOKEN_TYPE)
    assert payload["sub"] == "user-1"
    assert payload["jti"] == jti
    assert payload["type"] == ACCESS_TOKEN_TYPE


@pytest.mark.asyncio
async def test_refresh_token_round_trip(monkeypatch) -> None:
    async def not_denylisted(jti: str) -> bool:
        return False

    monkeypatch.setattr("app.core.security.is_token_denylisted", not_denylisted)
    token, jti = create_refresh_token("user-1")
    payload = await decode_token(token, REFRESH_TOKEN_TYPE)
    assert payload["sub"] == "user-1"
    assert payload["jti"] == jti


@pytest.mark.asyncio
async def test_decode_rejects_wrong_token_type() -> None:
    token, _ = create_access_token("user-1")
    with pytest.raises(InvalidCredentialsError):
        await decode_token(token, REFRESH_TOKEN_TYPE)


@pytest.mark.asyncio
async def test_decode_rejects_tampered_token() -> None:
    token, _ = create_access_token("user-1")
    tampered = token[:-4] + "abcd"
    with pytest.raises(InvalidCredentialsError):
        await decode_token(tampered, ACCESS_TOKEN_TYPE)


@pytest.mark.asyncio
async def test_decode_rejects_denylisted_token(monkeypatch) -> None:
    async def denylisted(jti: str) -> bool:
        return True

    monkeypatch.setattr("app.core.security.is_token_denylisted", denylisted)
    token, _ = create_access_token("user-1")
    with pytest.raises(InvalidCredentialsError):
        await decode_token(token, ACCESS_TOKEN_TYPE)


@pytest.mark.asyncio
async def test_decode_rejects_expired_token(monkeypatch) -> None:
    async def not_denylisted(jti: str) -> bool:
        return False

    monkeypatch.setattr("app.core.security.is_token_denylisted", not_denylisted)
    token = _expired_token()
    with pytest.raises(TokenExpiredError):
        await decode_token(token, ACCESS_TOKEN_TYPE)


def _expired_token() -> str:
    payload = {
        "sub": "user-1",
        "type": ACCESS_TOKEN_TYPE,
        "jti": "deadbeef",
        "iat": int(time.time()) - 7200,
        "exp": int(time.time()) - 3600,
    }
    return pyjwt.encode(payload, settings.SECRET_KEY.get_secret_value(), algorithm=settings.JWT_ALGORITHM)
