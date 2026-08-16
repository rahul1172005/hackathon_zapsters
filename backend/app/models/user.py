from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "user"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    hashed_password: Mapped[str] = mapped_column(String(255))
    title: Mapped[str | None] = mapped_column(String(128), default=None)
    bio: Mapped[str | None] = mapped_column(String(2000), default=None)
    avatar: Mapped[str | None] = mapped_column(String(512), default=None)
    github_handle: Mapped[str | None] = mapped_column(String(128), default=None)
    linkedin_url: Mapped[str | None] = mapped_column(String(512), default=None)
    roles: Mapped[list[str]] = mapped_column(default=list)
    skills: Mapped[list[str]] = mapped_column(default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    @property
    def is_superuser(self) -> bool:
        return "admin" in self.roles
