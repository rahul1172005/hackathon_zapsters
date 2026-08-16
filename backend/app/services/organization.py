from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hackathon import Hackathon
from app.repositories.organization import OrganizationRepository


class OrganizationService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = OrganizationRepository(session)

    async def list_hackathons(self, slug: str) -> list[Hackathon]:
        organization = await self._repo.get_by_slug(slug)
        if organization is None:
            return []
        return await self._repo.list_hackathons(organization.id)
