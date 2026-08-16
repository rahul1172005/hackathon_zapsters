import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.notification import NotificationRepository
from app.schemas.notification import NotificationCreate, NotificationSummary


class NotificationService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = NotificationRepository(session)
        self._session = session

    async def list_for_user(self, user_id: str | uuid.UUID) -> list[Notification]:
        return await self._repo.list_for_user(user_id)

    async def create(self, payload: NotificationCreate) -> Notification:
        notification = Notification(
            user_id=payload.user_id,
            title=payload.title,
            body=payload.body,
            type=payload.type,
        )
        self._session.add(notification)
        await self._session.commit()
        await self._session.refresh(notification)
        return notification

    async def mark_read(self, notification_id: str | uuid.UUID, user_id: str | uuid.UUID) -> Notification | None:
        notification = await self._repo.get_by_id(notification_id)
        if notification is None or notification.user_id != uuid.UUID(str(user_id)):
            return None
        if notification.read_at is None:
            notification.read_at = datetime.now(UTC)
            await self._session.commit()
            await self._session.refresh(notification)
        return notification

    async def mark_all_read(self, user_id: str | uuid.UUID) -> None:
        await self._session.execute(
            update(Notification)
            .where(Notification.user_id == uuid.UUID(str(user_id)), Notification.read_at.is_(None))
            .values(read_at=datetime.now(UTC))
        )
        await self._session.commit()

    async def summary(self, user_id: str | uuid.UUID) -> NotificationSummary:
        uid = uuid.UUID(str(user_id))
        total = await self._session.scalar(
            select(func.count()).select_from(Notification).where(Notification.user_id == uid)
        )
        unread = await self._session.scalar(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == uid, Notification.read_at.is_(None))
        )
        return NotificationSummary(total_count=total or 0, unread_count=unread or 0)
