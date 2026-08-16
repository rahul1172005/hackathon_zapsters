import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Team(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "team"

    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(256))
    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathon.id"), index=True)
    track: Mapped[str | None] = mapped_column(String(128), default=None)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")
    activity_level: Mapped[str] = mapped_column(String(32), default="MEDIUM")
    rank: Mapped[int] = mapped_column(default=0)
    score: Mapped[float] = mapped_column(default=0.0)
    score_trend: Mapped[str] = mapped_column(String(16), default="—")
    invite_code: Mapped[str | None] = mapped_column(String(16), unique=True, default=None, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
