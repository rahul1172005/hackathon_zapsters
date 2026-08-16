import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Judge(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "judge"

    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("user.id"), default=None)
    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathon.id"), index=True)
    name: Mapped[str] = mapped_column(String(256))
    email: Mapped[str] = mapped_column(String(320))
    organization: Mapped[str | None] = mapped_column(String(256), default=None)
    role: Mapped[str | None] = mapped_column(String(128), default=None)
    avatar: Mapped[str | None] = mapped_column(String(512), default=None)
    assigned_teams_count: Mapped[int] = mapped_column(default=0)
    completed_count: Mapped[int] = mapped_column(default=0)
    remaining_count: Mapped[int] = mapped_column(default=0)
