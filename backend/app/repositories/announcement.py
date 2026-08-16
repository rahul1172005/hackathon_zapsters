import uuid

from sqlalchemy import select

from app.models.announcement import Announcement
from app.repositories.base import BaseRepository


class AnnouncementRepository(BaseRepository):
    model = Announcement

    async def list_by_hackathon(self, hackathon_id: str | uuid.UUID) -> list[Announcement]:
        result = await self._session.execute(
            select(Announcement)
            .where(Announcement.hackathon_id == uuid.UUID(str(hackathon_id)))
            .order_by(Announcement.created_at.desc())
        )
        return list(result.scalars().all())
