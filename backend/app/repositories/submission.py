import uuid

from sqlalchemy import select

from app.models.submission import Submission
from app.repositories.base import BaseRepository


class SubmissionRepository(BaseRepository):
    model = Submission

    async def list_by_hackathon(self, hackathon_id: str | uuid.UUID) -> list[Submission]:
        result = await self._session.execute(
            select(Submission).where(Submission.hackathon_id == uuid.UUID(str(hackathon_id)))
        )
        return list(result.scalars().all())

    async def get_by_team(self, team_id: str | uuid.UUID) -> Submission | None:
        result = await self._session.execute(select(Submission).where(Submission.team_id == uuid.UUID(str(team_id))))
        return result.scalar_one_or_none()
