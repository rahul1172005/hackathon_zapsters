import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class TeamMember(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "team_member"

    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("team.id"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"), index=True)
    role: Mapped[str] = mapped_column(String(64), default="member")
    contribution_percentage: Mapped[int] = mapped_column(default=0)
