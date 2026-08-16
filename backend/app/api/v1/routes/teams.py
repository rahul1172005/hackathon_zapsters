from fastapi import APIRouter, Response, status

from app.api.deps import CurrentUser, SessionDep
from app.schemas.team import TeamCreate, TeamDetail, TeamInviteRead, TeamJoin, TeamRead
from app.services.team import TeamService

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=list[TeamRead])
async def list_teams(hackathon_id: str | None, session: SessionDep) -> list[TeamRead]:
    teams = await TeamService(session).list_by_hackathon(hackathon_id)
    return [TeamRead.model_validate(t) for t in teams]


@router.post("", response_model=TeamRead, status_code=201)
async def create_team(payload: TeamCreate, session: SessionDep, current_user: CurrentUser) -> TeamRead:
    team = await TeamService(session).create(current_user, payload)
    return TeamRead.model_validate(team)


@router.post("/join", response_model=TeamRead, status_code=201)
async def join_team(payload: TeamJoin, session: SessionDep, current_user: CurrentUser) -> TeamRead:
    team = await TeamService(session).join_by_code(current_user, payload)
    return TeamRead.model_validate(team)


@router.get("/{team_slug}", response_model=TeamDetail)
async def get_team(team_slug: str, session: SessionDep) -> TeamDetail:
    service = TeamService(session)
    team = await service.get_by_slug(team_slug)
    _, members, tasks, activity_log, project = await service.get_detail(team.id)
    result = TeamDetail.model_validate(team)
    result.members = members
    result.tasks = tasks
    result.activity_log = activity_log
    result.project = project
    return result


@router.post("/{team_id}/invite", response_model=TeamInviteRead)
async def generate_invite(team_id: str, session: SessionDep, current_user: CurrentUser) -> TeamInviteRead:
    team = await TeamService(session).invite_code(current_user, team_id)
    assert team.invite_code is not None
    return TeamInviteRead(team_id=team.id, slug=team.slug, name=team.name, invite_code=team.invite_code)


@router.post("/{team_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_team(team_id: str, session: SessionDep, current_user: CurrentUser) -> Response:
    await TeamService(session).leave(current_user, team_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
