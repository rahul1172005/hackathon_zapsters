from sqlalchemy.ext.asyncio import AsyncSession

from app.models.judge import Judge
from app.repositories.judge import JudgeRepository
from app.schemas.judge import JudgeCreate


class JudgeService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = JudgeRepository(session)
        self._session = session

    async def list_by_hackathon(self, hackathon_id: str | None) -> list[Judge]:
        if hackathon_id:
            return await self._repo.list_by_hackathon(hackathon_id)
        return await self._repo.list_all()

    async def create(self, data: JudgeCreate) -> Judge:
        judge = Judge(**data.model_dump(), assigned_teams_count=0, completed_count=0, remaining_count=0)
        self._session.add(judge)
        await self._session.commit()
        await self._session.refresh(judge)
        return judge
