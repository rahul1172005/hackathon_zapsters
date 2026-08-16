import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Announcement(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "announcement"

    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathon.id"), index=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("user.id"), default=None)
    title: Mapped[str] = mapped_column(String(512))
    body: Mapped[str | None] = mapped_column(String(8000), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
