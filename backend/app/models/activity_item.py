import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class ActivityItem(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "activity_item"

    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("team.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    author: Mapped[str] = mapped_column(String(128))
    action: Mapped[str] = mapped_column(String(256))
    detail: Mapped[str | None] = mapped_column(String(2000), default=None)
    type: Mapped[str] = mapped_column(String(32))
