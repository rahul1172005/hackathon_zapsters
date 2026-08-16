import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.team import Team
from app.repositories.judge import EvaluationRepository
from app.repositories.team import TeamRepository

SUBMITTED_STATUS = "SUBMITTED"


class LeaderboardService:
    """Compute live leaderboard standings from submitted evaluation aggregates.

    A team's leaderboard score is the mean of the weighted rubric totals of its
    submitted evaluations (each rubric category is capped at its rubric maximum
    when the evaluation is saved, so the stored ``total_score`` already reflects
    the hackathon's rubric weights). Teams without any submitted evaluation yet
    fall back to their stored score so standings stay populated during judging.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._team_repo = TeamRepository(session)
        self._evaluation_repo = EvaluationRepository(session)
        self._session = session

    async def standings(self, hackathon_id: str | None = None) -> list[Team]:
        if hackathon_id:
            teams = await self._team_repo.list_by_hackathon(hackathon_id)
        else:
            teams = await self._team_repo.list_all()

        aggregate_scores = await self._aggregate_scores(hackathon_id)

        for team in teams:
            computed = aggregate_scores.get(team.id)
            if computed is not None:
                team.score = computed

        ranked = sorted(teams, key=lambda t: (t.score, t.id), reverse=True)
        for index, team in enumerate(ranked, start=1):
            if team.rank != index:
                team.rank = index
        await self._session.commit()
        return ranked

    async def _aggregate_scores(self, hackathon_id: str | None) -> dict[uuid.UUID, float]:
        evaluations = await self._evaluation_repo.list_all()
        totals: dict[uuid.UUID, list[float]] = {}
        for evaluation in evaluations:
            if evaluation.status != SUBMITTED_STATUS:
                continue
            if hackathon_id and str(evaluation.hackathon_id) != str(hackathon_id):
                continue
            totals.setdefault(evaluation.team_id, []).append(evaluation.total_score)
        return {team_id: round(sum(scores) / len(scores), 2) for team_id, scores in totals.items()}
