import uuid

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class JudgeCreate(BaseModel):
    user_id: uuid.UUID | None = None
    hackathon_id: uuid.UUID
    name: str = Field(min_length=1, max_length=256)
    email: EmailStr
    organization: str | None = None
    role: str | None = None
    avatar: str | None = None


class JudgeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None
    name: str
    email: EmailStr
    organization: str | None
    role: str | None
    avatar: str | None
    assigned_teams_count: int
    completed_count: int
    remaining_count: int
