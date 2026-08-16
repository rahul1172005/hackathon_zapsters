from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.user import UserRead, UserUpdate
from app.services.user import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def get_me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)


@router.patch("/me", response_model=UserRead)
async def update_me(payload: UserUpdate, session: SessionDep, current_user: CurrentUser) -> UserRead:
    user = await UserService(session).update_profile(current_user, payload)
    return UserRead.model_validate(user)


@router.get("/{username}", response_model=UserRead)
async def get_public_profile(username: str, session: SessionDep) -> UserRead:
    user = await UserService(session).get_public(username)
    return UserRead.model_validate(user)
