from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, InvalidCredentialsError
from app.core.security import ACCESS_TOKEN_TYPE, decode_token
from app.db.session import get_db_session
from app.models.user import User
from app.repositories.user import UserRepository

SessionDep = Annotated[AsyncSession, Depends(get_db_session)]

http_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    session: SessionDep,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(http_bearer)],
) -> User:
    if credentials is None:
        raise InvalidCredentialsError()
    payload = await decode_token(credentials.credentials, ACCESS_TOKEN_TYPE)
    user = await UserRepository(session).get_by_id(str(payload["sub"]))
    if user is None or not user.is_active:
        raise InvalidCredentialsError()
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*roles: str):
    async def dependency(current_user: CurrentUser) -> User:
        if not set(roles).intersection(current_user.roles) and not current_user.is_superuser:
            raise ForbiddenError()
        return current_user

    return dependency
