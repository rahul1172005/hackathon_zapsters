from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.submission import StandingRead, SubmissionCreate, SubmissionRead
from app.services.evaluation import EvaluationService
from app.services.submission import SubmissionService

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.get("", response_model=list[SubmissionRead])
async def list_submissions(hackathon_id: str | None, session: SessionDep) -> list[SubmissionRead]:
    if not hackathon_id:
        return []
    return await SubmissionService(session).list_read_by_hackathon(hackathon_id)


@router.get("/standings", response_model=list[StandingRead])
async def submission_standings(hackathon_id: str, session: SessionDep) -> list[StandingRead]:
    return await EvaluationService(session).standings(hackathon_id)


@router.get("/team/{team_id}", response_model=SubmissionRead)
async def get_team_submission(team_id: str, session: SessionDep, current_user: CurrentUser) -> SubmissionRead:
    return await SubmissionService(session).get_read_by_team(current_user, team_id)


@router.post("", response_model=SubmissionRead, status_code=201)
async def create_or_update_submission(
    payload: SubmissionCreate, session: SessionDep, current_user: CurrentUser
) -> SubmissionRead:
    submission = await SubmissionService(session).create_or_update(current_user, payload)
    return await SubmissionService(session).to_read(submission)


@router.post("/{team_id}/submit", response_model=SubmissionRead)
async def submit_submission(team_id: str, session: SessionDep, current_user: CurrentUser) -> SubmissionRead:
    submission = await SubmissionService(session).submit(current_user, team_id)
    return await SubmissionService(session).to_read(submission)
