from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.judge import JudgeCreate, JudgeRead
from app.services.judge import JudgeService

router = APIRouter(prefix="/judges", tags=["judges"])


@router.get("", response_model=list[JudgeRead])
async def list_judges(hackathon_id: str | None, session: SessionDep) -> list[JudgeRead]:
    judges = await JudgeService(session).list_by_hackathon(hackathon_id)
    return [JudgeRead.model_validate(j) for j in judges]


@router.post("", response_model=JudgeRead, status_code=201)
async def create_judge(payload: JudgeCreate, session: SessionDep, current_user: CurrentUser) -> JudgeRead:
    judge = await JudgeService(session).create(payload)
    return JudgeRead.model_validate(judge)
