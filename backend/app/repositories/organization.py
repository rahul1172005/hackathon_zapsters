from sqlalchemy import select

from app.models.hackathon import Hackathon
from app.models.organization import Organization
from app.repositories.base import BaseRepository


class OrganizationRepository(BaseRepository):
    model = Organization

    async def get_by_slug(self, slug: str) -> Organization | None:
        result = await self._session.execute(select(Organization).where(Organization.slug == slug))
        return result.scalar_one_or_none()

    async def list_hackathons(self, organization_id) -> list[Hackathon]:
        result = await self._session.execute(select(Hackathon).where(Hackathon.organization_id == organization_id))
        return list(result.scalars().all())
