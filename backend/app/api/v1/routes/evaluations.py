from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.evaluation import EvaluationCreate, EvaluationRead
from app.services.evaluation import EvaluationService

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.get("/team/{team_id}", response_model=EvaluationRead)
async def get_evaluation(team_id: str, session: SessionDep, current_user: CurrentUser) -> EvaluationRead:
    # Judges evaluate teams; look up by the current user's judge record is a
    # follow-up; here we resolve the first judge linked to the authenticated user.
    return await EvaluationService(session).get_read_for_judge_and_team(current_user.id, team_id)


@router.post("", response_model=EvaluationRead, status_code=201)
async def save_evaluation(payload: EvaluationCreate, session: SessionDep, current_user: CurrentUser) -> EvaluationRead:
    evaluation = await EvaluationService(session).save(payload)
    return await EvaluationService(session).to_read(evaluation)
