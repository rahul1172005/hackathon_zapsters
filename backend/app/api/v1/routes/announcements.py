from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.announcement import AnnouncementCreate, AnnouncementRead
from app.services.announcement import AnnouncementService

router = APIRouter(prefix="/hackathons/{hackathon_id}/announcements", tags=["announcements"])


@router.get("", response_model=list[AnnouncementRead])
async def list_announcements(hackathon_id: str, session: SessionDep) -> list[AnnouncementRead]:
    return await AnnouncementService(session).list_by_hackathon(hackathon_id)


@router.post("", response_model=AnnouncementRead, status_code=201)
async def create_announcement(
    hackathon_id: str,
    payload: AnnouncementCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> AnnouncementRead:
    return await AnnouncementService(session).create(current_user, hackathon_id, payload)
