import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Prize(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "prize"

    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathon.id"), index=True)
    title: Mapped[str] = mapped_column(String(256))
    amount: Mapped[str | None] = mapped_column(String(128), default=None)
    description: Mapped[str | None] = mapped_column(String(2000), default=None)
