import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RegistrationCreate(BaseModel):
    hackathon_id: uuid.UUID
    team_name: str | None = None
    track: str | None = None
    team_size: int = Field(default=1, ge=1, le=5)


class RegistrationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    hackathon_id: uuid.UUID
    team_name: str | None
    track: str | None
    team_size: int
    status: str
    payment_status: str
    registered_at: datetime
