import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.announcement import Announcement
from app.models.user import User
from app.repositories.announcement import AnnouncementRepository
from app.repositories.hackathon import HackathonRepository
from app.repositories.notification import NotificationRepository
from app.repositories.registration import RegistrationRepository
from app.schemas.announcement import AnnouncementCreate, AnnouncementRead


class AnnouncementService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = AnnouncementRepository(session)
        self._hackathon_repo = HackathonRepository(session)
        self._notif_repo = NotificationRepository(session)
        self._reg_repo = RegistrationRepository(session)
        self._session = session

    async def list_by_hackathon(self, hackathon_id: str | uuid.UUID) -> list[AnnouncementRead]:
        announcements = await self._repo.list_by_hackathon(hackathon_id)
        recipient_count = len(await self._reg_repo.list_user_ids_by_hackathon(hackathon_id))
        return [
            AnnouncementRead.model_validate(a).model_copy(update={"recipient_count": recipient_count})
            for a in announcements
        ]

    async def create(self, user: User, hackathon_id: str, data: AnnouncementCreate) -> AnnouncementRead:
        if await self._hackathon_repo.get_by_id(hackathon_id) is None:
            raise NotFoundError()
        announcement = Announcement(
            hackathon_id=uuid.UUID(hackathon_id),
            created_by=user.id,
            title=data.title,
            body=data.body,
        )
        self._session.add(announcement)
        await self._session.commit()
        await self._session.refresh(announcement)
        recipient_count = await self._fan_out(announcement)
        return AnnouncementRead.model_validate(announcement).model_copy(update={"recipient_count": recipient_count})

    async def _fan_out(self, announcement: Announcement) -> int:
        user_ids = await self._reg_repo.list_user_ids_by_hackathon(announcement.hackathon_id)
        if not user_ids:
            return 0
        await self._notif_repo.bulk_create(
            user_ids,
            title=announcement.title,
            body=announcement.body or "",
            type="ANNOUNCEMENT",
        )
        await self._session.commit()
        return len(user_ids)
