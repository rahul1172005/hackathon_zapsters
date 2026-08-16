import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Submission(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "submission"

    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("team.id"), index=True)
    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathon.id"), index=True)
    track: Mapped[str | None] = mapped_column(String(128), default=None)
    project_name: Mapped[str] = mapped_column(String(256))
    tagline: Mapped[str | None] = mapped_column(String(512), default=None)
    description: Mapped[str | None] = mapped_column(String(8000), default=None)
    repo_url: Mapped[str | None] = mapped_column(String(512), default=None)
    demo_url: Mapped[str | None] = mapped_column(String(512), default=None)
    presentation_url: Mapped[str | None] = mapped_column(String(512), default=None)
    tech_stack: Mapped[list[str]] = mapped_column(default=list)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    status: Mapped[str] = mapped_column(String(32), default="DRAFT")
    evaluation_count: Mapped[int] = mapped_column(default=0)
    average_score: Mapped[float] = mapped_column(Float, default=0.0)
