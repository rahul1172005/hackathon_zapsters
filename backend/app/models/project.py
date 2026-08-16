import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Project(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "project"

    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("team.id"), index=True)
    name: Mapped[str] = mapped_column(String(256))
    tagline: Mapped[str | None] = mapped_column(String(512), default=None)
    description: Mapped[str | None] = mapped_column(String(8000), default=None)
    repo_url: Mapped[str | None] = mapped_column(String(512), default=None)
    demo_url: Mapped[str | None] = mapped_column(String(512), default=None)
    presentation_url: Mapped[str | None] = mapped_column(String(512), default=None)
    tech_stack: Mapped[list[str]] = mapped_column(default=list)
    screenshots: Mapped[list[str]] = mapped_column(default=list)
    commits_count: Mapped[int] = mapped_column(Integer, default=0)
    prs_count: Mapped[int] = mapped_column(Integer, default=0)
    issues_count: Mapped[int] = mapped_column(Integer, default=0)
    tasks_count: Mapped[int] = mapped_column(Integer, default=0)
    active_days: Mapped[int] = mapped_column(Integer, default=0)
