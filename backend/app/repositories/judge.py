import uuid

from sqlalchemy import select

from app.models.evaluation import Evaluation
from app.models.judge import Judge
from app.repositories.base import BaseRepository


class JudgeRepository(BaseRepository):
    model = Judge

    async def list_by_hackathon(self, hackathon_id: str | uuid.UUID) -> list[Judge]:
        result = await self._session.execute(select(Judge).where(Judge.hackathon_id == uuid.UUID(str(hackathon_id))))
        return list(result.scalars().all())


class EvaluationRepository(BaseRepository):
    model = Evaluation

    async def get_for_judge_and_team(self, judge_id, team_id) -> Evaluation | None:
        result = await self._session.execute(
            select(Evaluation).where(
                Evaluation.judge_id == uuid.UUID(str(judge_id)),
                Evaluation.team_id == uuid.UUID(str(team_id)),
            )
        )
        return result.scalar_one_or_none()

    async def list_by_judge(self, judge_id) -> list[Evaluation]:
        result = await self._session.execute(select(Evaluation).where(Evaluation.judge_id == uuid.UUID(str(judge_id))))
        return list(result.scalars().all())
