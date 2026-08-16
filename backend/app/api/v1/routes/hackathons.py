from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.hackathon import (
    HackathonCreate,
    HackathonDetail,
    HackathonRead,
    HackathonUpdate,
    RubricSettings,
)
from app.services.hackathon import HackathonService

router = APIRouter(prefix="/hackathons", tags=["hackathons"])


@router.get("", response_model=list[HackathonRead])
async def list_hackathons(session: SessionDep) -> list[HackathonRead]:
    hackathons = await HackathonService(session).list()
    return [HackathonRead.model_validate(h) for h in hackathons]


@router.post("", response_model=HackathonRead, status_code=201)
async def create_hackathon(payload: HackathonCreate, session: SessionDep, current_user: CurrentUser) -> HackathonRead:
    hackathon = await HackathonService(session).create(current_user, payload)
    return HackathonRead.model_validate(hackathon)


@router.get("/{hackathon_id}", response_model=HackathonDetail)
async def get_hackathon(hackathon_id: str, session: SessionDep) -> HackathonDetail:
    detail = await HackathonService(session).get_detail(hackathon_id)
    result = HackathonDetail.model_validate(detail["hackathon"])
    result.tracks = detail["tracks"]
    result.timeline = detail["timeline"]
    result.prizes = detail["prizes"]
    result.sponsors = detail["sponsors"]
    return result


@router.patch("/{hackathon_id}", response_model=HackathonRead)
async def update_hackathon(
    hackathon_id: str, payload: HackathonUpdate, session: SessionDep, current_user: CurrentUser
) -> HackathonRead:
    hackathon = await HackathonService(session).update(current_user, hackathon_id, payload)
    return HackathonRead.model_validate(hackathon)


@router.post("/{hackathon_id}/status", response_model=HackathonRead)
async def set_status(hackathon_id: str, status: str, session: SessionDep, current_user: CurrentUser) -> HackathonRead:
    hackathon = await HackathonService(session).update_status(current_user, hackathon_id, status)
    return HackathonRead.model_validate(hackathon)


@router.get("/{hackathon_id}/rubric", response_model=RubricSettings)
async def get_rubric(hackathon_id: str, session: SessionDep) -> RubricSettings:
    rubric = await HackathonService(session).get_rubric(hackathon_id)
    return RubricSettings(**rubric)


@router.put("/{hackathon_id}/rubric", response_model=RubricSettings)
async def set_rubric(
    hackathon_id: str, payload: RubricSettings, session: SessionDep, current_user: CurrentUser
) -> RubricSettings:
    rubric = await HackathonService(session).set_rubric(current_user, hackathon_id, payload.model_dump())
    return RubricSettings(**rubric)
