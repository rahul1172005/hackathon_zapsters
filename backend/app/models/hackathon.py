import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Hackathon(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "hackathon"

    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(256))
    tagline: Mapped[str | None] = mapped_column(String(512), default=None)
    description: Mapped[str | None] = mapped_column(String(8000), default=None)
    status: Mapped[str] = mapped_column(String(32), default="UPCOMING")
    start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    duration_hours: Mapped[int] = mapped_column(default=0)
    location: Mapped[str | None] = mapped_column(String(256), default=None)
    is_online: Mapped[bool] = mapped_column(default=True)
    prize_pool: Mapped[str | None] = mapped_column(String(128), default=None)
    participants_count: Mapped[int] = mapped_column(default=0)
    teams_count: Mapped[int] = mapped_column(default=0)
    submission_rate: Mapped[int] = mapped_column(default=0)
    judging_rate: Mapped[int] = mapped_column(default=0)
    active_teams_count: Mapped[int] = mapped_column(default=0)
    rules: Mapped[list[str]] = mapped_column(default=list)
    faqs: Mapped[list[dict]] = mapped_column(default=list)
    rubric: Mapped[dict | None] = mapped_column(default=None)
    organization_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("organization.id"), default=None)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("user.id"), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
