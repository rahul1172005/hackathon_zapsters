import uuid
from datetime import UTC, datetime, timedelta

import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings
from app.core.exceptions import InvalidCredentialsError, TokenExpiredError
from app.core.redis_client import is_token_denylisted

password_hash = PasswordHash.recommended()

ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return password_hash.verify(password, hashed)


def _encode_token(subject: str, token_type: str, ttl: timedelta) -> tuple[str, str]:
    now = datetime.now(UTC)
    jti = uuid.uuid4().hex
    payload = {
        "sub": subject,
        "type": token_type,
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int((now + ttl).timestamp()),
    }
    token = jwt.encode(payload, settings.SECRET_KEY.get_secret_value(), algorithm=settings.JWT_ALGORITHM)
    return token, jti


def create_access_token(user_id: str) -> tuple[str, str]:
    ttl = timedelta(seconds=settings.JWT_ACCESS_TOKEN_EXPIRE_SECONDS)
    return _encode_token(str(user_id), ACCESS_TOKEN_TYPE, ttl)


def create_refresh_token(user_id: str) -> tuple[str, str]:
    ttl = timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    return _encode_token(str(user_id), REFRESH_TOKEN_TYPE, ttl)


async def decode_token(token: str, expected_type: str) -> dict:
    """Verify signature, token type, and denylist state.

    The algorithm list is explicit (never inferred from the header) and the
    jti is checked against the Redis denylist before the payload is trusted
    (SOP §7.1-7.2).
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY.get_secret_value(),
            algorithms=[settings.JWT_ALGORITHM],
        )
    except ExpiredSignatureError as exc:
        raise TokenExpiredError() from exc
    except InvalidTokenError as exc:
        raise InvalidCredentialsError() from exc

    if payload.get("type") != expected_type:
        raise InvalidCredentialsError()

    jti = payload.get("jti")
    if not jti or await is_token_denylisted(str(jti)):
        raise InvalidCredentialsError()

    subject = payload.get("sub")
    if subject is None:
        raise InvalidCredentialsError()
    return payload
