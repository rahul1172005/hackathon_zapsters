import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class TimelinePhase(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "timeline_phase"

    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathon.id"), index=True)
    name: Mapped[str] = mapped_column(String(128))
    date: Mapped[str] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(32), default="UPCOMING")
