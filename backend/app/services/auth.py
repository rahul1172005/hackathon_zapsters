import uuid
from datetime import UTC, datetime, timedelta

import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ConflictError, InvalidCredentialsError
from app.core.logging import get_logger
from app.core.redis_client import revoke_token
from app.core.security import (
    ACCESS_TOKEN_TYPE,
    REFRESH_TOKEN_TYPE,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user import UserRepository
from app.services.email import EmailService

logger = get_logger("auth")

VERIFY_EMAIL_TOKEN_TYPE = "verify_email"
RESET_PASSWORD_TOKEN_TYPE = "reset_password"

EMAIL_VERIFY_TOKEN_EXPIRE_SECONDS = 24 * 60 * 60
RESET_TOKEN_EXPIRE_SECONDS = 30 * 60

_email_service = EmailService()


def _create_signed_token(user_id: str, token_type: str, ttl_seconds: int) -> str:
    """Issue a short-lived, signed token (email verification / password reset).

    Reuses the same signing key and claims as ``core/security`` so tokens can be
    verified with the shared ``decode_token`` utility (SOP §7.1).
    """
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "jti": uuid.uuid4().hex,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=ttl_seconds)).timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY.get_secret_value(), algorithm=settings.JWT_ALGORITHM)


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = UserRepository(session)
        self._session = session

    async def register(self, email: str, username: str, name: str, password: str) -> tuple[User, str, str]:
        if await self._repo.get_by_email(email):
            raise ConflictError("A user with this email already exists")
        if await self._repo.get_by_username(username):
            raise ConflictError("This username is already taken")

        user = User(
            email=email,
            username=username,
            name=name,
            hashed_password=hash_password(password),
            roles=["participant"],
            skills=[],
        )
        self._session.add(user)
        await self._session.commit()
        await self._session.refresh(user)

        await self._send_verification_email(user.email, str(user.id))

        access_token, _ = create_access_token(str(user.id))
        refresh_token, _ = create_refresh_token(str(user.id))
        return user, access_token, refresh_token

    async def _send_verification_email(self, email: str, user_id: str) -> None:
        token = _create_signed_token(user_id, VERIFY_EMAIL_TOKEN_TYPE, EMAIL_VERIFY_TOKEN_EXPIRE_SECONDS)
        try:
            await _email_service.send_verification_email(email, token)
        except Exception as exc:  # noqa: BLE001 - a failed email must never break signup
            logger.warning("verification email could not be sent", error=str(exc))

    async def verify_email(self, token: str) -> User:
        payload = await decode_token(token, VERIFY_EMAIL_TOKEN_TYPE)
        user = await self._repo.get_by_id(str(payload["sub"]))
        if user is None or not user.is_active:
            raise InvalidCredentialsError()
        if not user.is_verified:
            user.is_verified = True
            await self._session.commit()
            await self._session.refresh(user)
        await revoke_token(str(payload["jti"]), EMAIL_VERIFY_TOKEN_EXPIRE_SECONDS)
        return user

    async def request_password_reset(self, email: str) -> None:
        user = await self._repo.get_by_email(email)
        if user is None or not user.is_active:
            # Uniform response whether or not the account exists (anti-enumeration).
            return
        token = _create_signed_token(str(user.id), RESET_PASSWORD_TOKEN_TYPE, RESET_TOKEN_EXPIRE_SECONDS)
        try:
            await _email_service.send_password_reset_email(user.email, token)
        except Exception as exc:  # noqa: BLE001 - a failed email must not reveal account state
            logger.warning("password reset email could not be sent", error=str(exc))

    async def reset_password(self, token: str, new_password: str) -> None:
        payload = await decode_token(token, RESET_PASSWORD_TOKEN_TYPE)
        user = await self._repo.get_by_id(str(payload["sub"]))
        if user is None or not user.is_active:
            raise InvalidCredentialsError()
        user.hashed_password = hash_password(new_password)
        await self._session.commit()
        await self._session.refresh(user)
        await revoke_token(str(payload["jti"]), RESET_TOKEN_EXPIRE_SECONDS)

    async def login(self, identifier: str, password: str) -> tuple[User, str, str]:
        user = await self._repo.get_by_identifier(identifier)
        if user is None or not verify_password(password, user.hashed_password):
            raise InvalidCredentialsError()
        if not user.is_active:
            raise InvalidCredentialsError()

        access_token, _ = create_access_token(str(user.id))
        refresh_token, _ = create_refresh_token(str(user.id))
        return user, access_token, refresh_token

    async def refresh(self, refresh_token: str) -> tuple[User, str, str]:
        payload = await decode_token(refresh_token, REFRESH_TOKEN_TYPE)
        user = await self._repo.get_by_id(str(payload["sub"]))
        if user is None or not user.is_active:
            raise InvalidCredentialsError()

        access_token, _ = create_access_token(str(user.id))
        new_refresh, new_refresh_jti = create_refresh_token(str(user.id))
        # Rotate: revoke the presented refresh token, issue a new one.
        await revoke_token(str(payload["jti"]), 7 * 24 * 3600)
        return user, access_token, new_refresh

    async def logout(self, access_token: str, refresh_token: str | None) -> None:
        access_payload = await decode_token(access_token, ACCESS_TOKEN_TYPE)
        await revoke_token(str(access_payload["jti"]), 15 * 60)
        if refresh_token:
            refresh_payload = await decode_token(refresh_token, REFRESH_TOKEN_TYPE)
            await revoke_token(str(refresh_payload["jti"]), 7 * 24 * 3600)
