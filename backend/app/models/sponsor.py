import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Sponsor(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "sponsor"

    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathon.id"), index=True)
    name: Mapped[str] = mapped_column(String(256))
    tier: Mapped[str] = mapped_column(String(32))
    logo: Mapped[str | None] = mapped_column(String(512), default=None)
