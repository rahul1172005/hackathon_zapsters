import secrets
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User
from app.repositories.team import TeamRepository
from app.schemas.team import TeamCreate, TeamJoin


class TeamService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = TeamRepository(session)
        self._session = session

    async def list_by_hackathon(self, hackathon_id: str | None) -> list[Team]:
        if hackathon_id:
            return await self._repo.list_by_hackathon(hackathon_id)
        return await self._repo.list_all()

    async def get_by_slug(self, slug: str) -> Team:
        team = await self._repo.get_by_slug(slug)
        if team is None:
            raise NotFoundError()
        return team

    async def get_detail(self, team_id: str | uuid.UUID):
        team = await self._repo.get_by_id(str(team_id))
        if team is None:
            raise NotFoundError()
        members = await self._repo.get_members(team_id)
        tasks = await self._repo.get_tasks(team_id)
        activity_log = await self._repo.get_activity(team_id)
        project = await self._repo.get_project(team_id)
        return team, members, tasks, activity_log, project

    async def create(self, user: User, data: TeamCreate) -> Team:
        existing = await self._repo.get_by_slug(data.slug)
        if existing is not None:
            raise ConflictError("A team with this slug already exists")
        team = Team(
            slug=data.slug,
            name=data.name,
            hackathon_id=data.hackathon_id,
            track=data.track,
            invite_code=secrets.token_hex(3).upper(),
        )
        self._session.add(team)
        await self._session.flush()
        self._session.add(TeamMember(team_id=team.id, user_id=user.id, role="lead", contribution_percentage=100))
        await self._session.commit()
        await self._session.refresh(team)
        return team

    async def join_by_code(self, user: User, data: TeamJoin) -> Team:
        team = await self._repo.get_by_invite_code(data.invite_code)
        if team is None:
            raise NotFoundError()
        members = await self._repo.get_members(team.id)
        if any(str(m.user_id) == str(user.id) for m in members):
            raise ConflictError("You are already a member of this team")
        if len(members) >= 5:
            raise ConflictError("This team is already at full capacity")
        self._session.add(TeamMember(team_id=team.id, user_id=user.id, role="member", contribution_percentage=0))
        await self._session.commit()
        await self._session.refresh(team)
        return team

    async def invite_code(self, user: User, team_id: str | uuid.UUID) -> Team:
        team = await self.get_by_slug_or_id(team_id)
        await self._ensure_member(team.id, user.id)
        team.invite_code = secrets.token_hex(3).upper()
        await self._session.commit()
        await self._session.refresh(team)
        return team

    async def leave(self, user: User, team_id: str | uuid.UUID) -> None:
        members = await self._repo.get_members(team_id)
        leads = [m for m in members if m.role == "lead"]
        member = next((m for m in members if str(m.user_id) == str(user.id)), None)
        if member is None:
            raise NotFoundError()
        if member.role == "lead" and len(leads) == 1 and len(members) > 1:
            raise ConflictError("Transfer team leadership before leaving")
        await self._session.delete(member)
        await self._session.commit()

    async def get_by_slug_or_id(self, team_id: str | uuid.UUID) -> Team:
        team = await self._repo.get_by_slug(str(team_id))
        if team is None:
            team = await self._repo.get_by_id(str(team_id))
        if team is None:
            raise NotFoundError()
        return team

    async def _ensure_member(self, team_id: uuid.UUID, user_id: uuid.UUID) -> None:
        members = await self._repo.get_members(team_id)
        if not any(str(m.user_id) == str(user_id) for m in members):
            raise ForbiddenError()
