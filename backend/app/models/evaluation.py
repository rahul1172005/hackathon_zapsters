import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Evaluation(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "evaluation"

    judge_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("judge.id"), index=True)
    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("team.id"), index=True)
    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathon.id"), index=True)
    scores: Mapped[dict] = mapped_column(default=dict)
    total_score: Mapped[float] = mapped_column(Float, default=0.0)
    notes: Mapped[str | None] = mapped_column(String(8000), default=None)
    status: Mapped[str] = mapped_column(String(32), default="DRAFT")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
