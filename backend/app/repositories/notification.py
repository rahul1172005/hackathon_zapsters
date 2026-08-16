import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository):
    model = Notification

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self._session = session

    async def list_for_user(self, user_id) -> list[Notification]:
        result = await self._session.execute(
            select(Notification)
            .where(Notification.user_id == uuid.UUID(str(user_id)))
            .order_by(Notification.created_at.desc())
        )
        return list(result.scalars().all())

    async def bulk_create(self, user_ids: list[uuid.UUID], title: str, body: str, type: str = "INFO") -> None:
        self._session.add_all([Notification(user_id=uid, title=title, body=body, type=type) for uid in user_ids])
        await self._session.flush()
