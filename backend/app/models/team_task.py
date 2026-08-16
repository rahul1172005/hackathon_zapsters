import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class TeamTask(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "team_task"

    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("team.id"), index=True)
    title: Mapped[str] = mapped_column(String(512))
    assignee_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("user.id"), default=None)
    status: Mapped[str] = mapped_column(String(32), default="TODO")
