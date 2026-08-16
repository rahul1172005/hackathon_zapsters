from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.models.registration import Registration
from app.models.user import User
from app.repositories.registration import RegistrationRepository
from app.schemas.registration import RegistrationCreate


class RegistrationService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = RegistrationRepository(session)
        self._session = session

    async def register(self, user: User, data: RegistrationCreate) -> Registration:
        existing = await self._repo.get_for_user_and_hackathon(user.id, data.hackathon_id)
        if existing is not None:
            raise ConflictError("Already registered for this hackathon")
        registration = Registration(
            user_id=user.id,
            hackathon_id=data.hackathon_id,
            team_name=data.team_name,
            track=data.track,
            team_size=data.team_size,
            status="CONFIRMED",
            payment_status="NONE",
        )
        self._session.add(registration)
        await self._session.commit()
        await self._session.refresh(registration)
        return registration

    async def list_for_user(self, user: User) -> list[Registration]:
        return await self._repo.list_by_user(user.id)

    async def cancel(self, user: User, registration_id: str) -> Registration:
        registration = await self._repo.get_by_id(registration_id)
        if registration is None:
            raise NotFoundError()
        if str(registration.user_id) != str(user.id):
            raise ForbiddenError()
        registration.status = "CANCELLED"
        await self._session.commit()
        await self._session.refresh(registration)
        return registration
