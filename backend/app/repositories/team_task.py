from app.models.team_task import TeamTask
from app.repositories.base import BaseRepository


class TeamTaskRepository(BaseRepository):
    model = TeamTask
