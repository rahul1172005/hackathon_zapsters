from fastapi import APIRouter, Depends, Query, Response, status

from app.api.deps import CurrentUser, SessionDep
from app.core.rate_limit import AppRateLimiter
from app.schemas.user import (
    DirectoryEntryRead,
    MatchCandidateRead,
    MatchingPreferences,
    MatchingPreferencesRead,
)
from app.services.matching import MatchingService

router = APIRouter(prefix="/matching", tags=["matching"])


@router.post("/preferences", response_model=MatchingPreferencesRead)
async def save_preferences(
    payload: MatchingPreferences,
    session: SessionDep,
    current_user: CurrentUser,
) -> MatchingPreferencesRead:
    return await MatchingService(session).save_preferences(current_user, payload)


@router.get("/preferences", response_model=MatchingPreferencesRead)
async def get_preferences(session: SessionDep, current_user: CurrentUser) -> MatchingPreferencesRead:
    return await MatchingService(session).get_preferences(current_user)


@router.delete("/preferences", status_code=status.HTTP_204_NO_CONTENT)
async def leave_pool(session: SessionDep, current_user: CurrentUser) -> Response:
    MatchingService(session).remove_preferences(current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/recommendations",
    response_model=list[MatchCandidateRead],
    dependencies=[Depends(AppRateLimiter("public"))],
)
async def recommendations(session: SessionDep, current_user: CurrentUser) -> list[MatchCandidateRead]:
    return await MatchingService(session).recommendations(current_user)


@router.get(
    "/directory",
    response_model=list[DirectoryEntryRead],
    dependencies=[Depends(AppRateLimiter("public"))],
)
async def directory(
    session: SessionDep,
    current_user: CurrentUser,
    role: str | None = Query(default=None),
    skills: str | None = Query(default=None),
    q: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
) -> list[DirectoryEntryRead]:
    return await MatchingService(session).directory(current_user, role=role, skills=skills, query=q, limit=limit)
