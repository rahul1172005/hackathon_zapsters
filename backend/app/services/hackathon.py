import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationError
from app.models.hackathon import Hackathon
from app.models.user import User
from app.repositories.hackathon import HackathonRepository
from app.schemas.hackathon import HackathonCreate, HackathonUpdate

HACKATHON_LIFECYCLE: dict[str, set[str]] = {
    "DRAFT": {"UPCOMING"},
    "UPCOMING": {"OPEN", "LIVE"},
    "OPEN": {"LIVE", "CANCELLED"},
    "LIVE": {"JUDGING", "CANCELLED"},
    "JUDGING": {"COMPLETED"},
    "COMPLETED": set(),
    "CANCELLED": set(),
}


class HackathonService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = HackathonRepository(session)
        self._session = session

    async def list(self) -> list[Hackathon]:
        return await self._repo.list_all()

    async def get_by_slug(self, slug: str) -> Hackathon:
        hackathon = await self._repo.get_by_slug(slug)
        if hackathon is None:
            raise NotFoundError()
        return hackathon

    async def get_by_id(self, hackathon_id: str | uuid.UUID) -> Hackathon:
        hackathon = await self._repo.get_by_id(str(hackathon_id))
        if hackathon is None:
            raise NotFoundError()
        return hackathon

    async def get_detail(self, hackathon_id: str):
        hackathon = await self.get_by_slug(hackathon_id)
        return {
            "hackathon": hackathon,
            "tracks": await self._repo.get_tracks(hackathon.id),
            "timeline": await self._repo.get_timeline(hackathon.id),
            "prizes": await self._repo.get_prizes(hackathon.id),
            "sponsors": await self._repo.get_sponsors(hackathon.id),
        }

    async def create(self, user: User, data: HackathonCreate) -> Hackathon:
        if data.status not in HACKATHON_LIFECYCLE:
            raise ValidationError("Invalid hackathon status")
        hackathon = Hackathon(**data.model_dump(), owner_id=user.id)
        self._session.add(hackathon)
        try:
            await self._session.commit()
        except Exception as exc:  # duplicate slug surfaces as IntegrityError
            await self._session.rollback()
            raise ConflictError("A hackathon with this slug already exists") from exc
        await self._session.refresh(hackathon)
        return hackathon

    async def update(self, user: User, hackathon_id: str, data: HackathonUpdate) -> Hackathon:
        hackathon = await self.get_by_id(hackathon_id)
        self._ensure_owner(hackathon, user)
        updates = data.model_dump(exclude_unset=True)
        if "status" in updates and updates["status"] not in HACKATHON_LIFECYCLE:
            raise ValidationError("Invalid hackathon status")
        for field, value in updates.items():
            setattr(hackathon, field, value)
        await self._session.commit()
        await self._session.refresh(hackathon)
        return hackathon

    async def update_status(self, user: User, hackathon_id: str, status: str) -> Hackathon:
        hackathon = await self.get_by_id(hackathon_id)
        self._ensure_owner(hackathon, user)
        allowed = HACKATHON_LIFECYCLE.get(hackathon.status, set())
        if status not in allowed:
            raise ConflictError(f"Cannot transition hackathon from {hackathon.status} to {status}")
        hackathon.status = status
        await self._session.commit()
        await self._session.refresh(hackathon)
        return hackathon

    async def get_rubric(self, hackathon_id: str | uuid.UUID) -> dict:
        hackathon = await self.get_by_id(hackathon_id)
        default = {"innovation": 30, "technical": 30, "impact": 20, "ux": 10, "presentation": 10}
        return hackathon.rubric or default

    async def set_rubric(self, user: User, hackathon_id: str, rubric: dict) -> dict:
        hackathon = await self.get_by_id(hackathon_id)
        self._ensure_owner(hackathon, user)
        hackathon.rubric = rubric
        await self._session.commit()
        await self._session.refresh(hackathon)
        return hackathon.rubric

    @staticmethod
    def _ensure_owner(hackathon: Hackathon, user: User) -> None:
        if hackathon.owner_id != user.id and not user.is_superuser:
            raise ForbiddenError()
