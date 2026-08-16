import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.registration import Registration
from app.repositories.base import BaseRepository


class RegistrationRepository(BaseRepository):
    model = Registration

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self._session = session

    async def get_for_user_and_hackathon(self, user_id, hackathon_id) -> Registration | None:
        result = await self._session.execute(
            select(Registration).where(
                Registration.user_id == uuid.UUID(str(user_id)),
                Registration.hackathon_id == uuid.UUID(str(hackathon_id)),
            )
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id) -> list[Registration]:
        result = await self._session.execute(
            select(Registration)
            .where(Registration.user_id == uuid.UUID(str(user_id)))
            .order_by(Registration.registered_at.desc())
        )
        return list(result.scalars().all())

    async def list_user_ids_by_hackathon(self, hackathon_id) -> list[uuid.UUID]:
        result = await self._session.execute(
            select(Registration.user_id).where(Registration.hackathon_id == uuid.UUID(str(hackathon_id)))
        )
        return [uuid.UUID(str(row)) for row in result.scalars().all()]
