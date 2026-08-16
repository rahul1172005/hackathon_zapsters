import uuid

from sqlalchemy import select

from app.models.activity_item import ActivityItem
from app.models.project import Project
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.team_task import TeamTask
from app.repositories.base import BaseRepository


class TeamRepository(BaseRepository):
    model = Team

    async def get_by_slug(self, slug: str) -> Team | None:
        result = await self._session.execute(select(Team).where(Team.slug == slug))
        return result.scalar_one_or_none()

    async def get_by_invite_code(self, invite_code: str) -> Team | None:
        result = await self._session.execute(select(Team).where(Team.invite_code == invite_code))
        return result.scalar_one_or_none()

    async def list_by_hackathon(self, hackathon_id: str | uuid.UUID) -> list[Team]:
        result = await self._session.execute(
            select(Team).where(Team.hackathon_id == uuid.UUID(str(hackathon_id))).order_by(Team.score.desc())
        )
        return list(result.scalars().all())

    async def get_members(self, team_id: str | uuid.UUID) -> list[TeamMember]:
        result = await self._session.execute(select(TeamMember).where(TeamMember.team_id == uuid.UUID(str(team_id))))
        return list(result.scalars().all())

    async def get_tasks(self, team_id: str | uuid.UUID) -> list[TeamTask]:
        result = await self._session.execute(select(TeamTask).where(TeamTask.team_id == uuid.UUID(str(team_id))))
        return list(result.scalars().all())

    async def get_activity(self, team_id: str | uuid.UUID) -> list[ActivityItem]:
        result = await self._session.execute(
            select(ActivityItem)
            .where(ActivityItem.team_id == uuid.UUID(str(team_id)))
            .order_by(ActivityItem.timestamp.desc())
        )
        return list(result.scalars().all())

    async def get_project(self, team_id: str | uuid.UUID) -> Project | None:
        result = await self._session.execute(select(Project).where(Project.team_id == uuid.UUID(str(team_id))))
        return result.scalar_one_or_none()

    async def is_member(self, team_id: str | uuid.UUID, user_id: str | uuid.UUID) -> bool:
        result = await self._session.execute(
            select(TeamMember.id).where(
                TeamMember.team_id == uuid.UUID(str(team_id)),
                TeamMember.user_id == uuid.UUID(str(user_id)),
            )
        )
        return result.scalar_one_or_none() is not None
