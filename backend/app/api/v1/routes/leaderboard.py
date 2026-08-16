from fastapi import APIRouter

from app.api.deps import SessionDep
from app.schemas.team import TeamRead
from app.services.leaderboard import LeaderboardService

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=list[TeamRead])
async def get_standings(session: SessionDep, hackathon_id: str | None = None) -> list[TeamRead]:
    teams = await LeaderboardService(session).standings(hackathon_id)
    return [TeamRead.model_validate(t) for t in teams]
