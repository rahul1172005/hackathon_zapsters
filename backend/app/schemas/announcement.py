import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=1, max_length=512)
    body: str | None = None


class AnnouncementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    hackathon_id: uuid.UUID
    created_by: uuid.UUID | None
    title: str
    body: str | None
    recipient_count: int = 0
    created_at: datetime
