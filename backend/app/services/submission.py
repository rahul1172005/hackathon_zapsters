import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.models.submission import Submission
from app.models.user import User
from app.repositories.submission import SubmissionRepository
from app.repositories.team import TeamRepository
from app.schemas.submission import SubmissionCreate, SubmissionRead


class SubmissionService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = SubmissionRepository(session)
        self._team_repo = TeamRepository(session)
        self._session = session

    async def list_by_hackathon(self, hackathon_id: str) -> list[Submission]:
        return await self._repo.list_by_hackathon(hackathon_id)

    async def list_read_by_hackathon(self, hackathon_id: str) -> list[SubmissionRead]:
        submissions = await self._repo.list_by_hackathon(hackathon_id)
        return [await self.to_read(submission) for submission in submissions]

    async def create_or_update(self, user: User, data: SubmissionCreate) -> Submission:
        if not await self._team_repo.is_member(data.team_id, user.id):
            raise ForbiddenError("Only team members may edit their submission")
        existing = await self._repo.get_by_team(data.team_id)
        if existing is not None:
            for field, value in data.model_dump().items():
                setattr(existing, field, value)
            await self._session.commit()
            await self._session.refresh(existing)
            return existing
        submission = Submission(**data.model_dump(), status="DRAFT")
        self._session.add(submission)
        await self._session.commit()
        await self._session.refresh(submission)
        return submission

    async def get_by_team(self, team_id: str | uuid.UUID) -> Submission:
        submission = await self._repo.get_by_team(team_id)
        if submission is None:
            raise NotFoundError()
        return submission

    async def get_read_by_team(self, user: User, team_id: str | uuid.UUID) -> SubmissionRead:
        if not await self._team_repo.is_member(team_id, user.id):
            raise ForbiddenError("Only team members may view their submission")
        submission = await self.get_by_team(team_id)
        return await self.to_read(submission)

    async def submit(self, user: User, team_id: str | uuid.UUID) -> Submission:
        submission = await self.get_by_team(team_id)
        if not await self._team_repo.is_member(team_id, user.id):
            raise ForbiddenError("Only team members may submit")
        if submission.status == "SUBMITTED":
            raise ConflictError("Submission is already submitted")
        submission.status = "SUBMITTED"
        await self._session.commit()
        await self._session.refresh(submission)
        return submission

    async def to_read(self, submission: Submission) -> SubmissionRead:
        read = SubmissionRead.model_validate(submission)
        team = await self._team_repo.get_by_id(str(submission.team_id))
        if team is not None:
            read.team_name = team.name
            read.team_slug = team.slug
        return read
