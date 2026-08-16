from fastapi import APIRouter

from app.api.deps import SessionDep
from app.schemas.hackathon import HackathonRead
from app.services.organization import OrganizationService

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("/{slug}/hackathons", response_model=list[HackathonRead])
async def list_organization_hackathons(slug: str, session: SessionDep) -> list[HackathonRead]:
    hackathons = await OrganizationService(session).list_hackathons(slug)
    return [HackathonRead.model_validate(h) for h in hackathons]
