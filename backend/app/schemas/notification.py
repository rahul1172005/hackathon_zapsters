import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    body: str | None
    type: str
    read_at: datetime | None
    created_at: datetime


class NotificationSummary(BaseModel):
    total_count: int
    unread_count: int


class NotificationCreate(BaseModel):
    user_id: uuid.UUID
    title: str = Field(min_length=1, max_length=512)
    body: str | None = Field(default=None, max_length=4000)
    type: str = Field(default="INFO", max_length=32)
