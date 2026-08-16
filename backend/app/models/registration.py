import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Registration(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "registration"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"), index=True)
    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathon.id"), index=True)
    team_name: Mapped[str | None] = mapped_column(String(128), default=None)
    track: Mapped[str | None] = mapped_column(String(128), default=None)
    team_size: Mapped[int] = mapped_column(default=1)
    status: Mapped[str] = mapped_column(String(32), default="PENDING")
    payment_status: Mapped[str] = mapped_column(String(32), default="NONE")
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
