import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TrackCreate(BaseModel):
    name: str = Field(max_length=128)
    description: str | None = None
    prize: str | None = None


class TrackRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    prize: str | None


class TimelinePhaseCreate(BaseModel):
    name: str = Field(max_length=128)
    date: str
    status: str = "UPCOMING"


class TimelinePhaseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    date: str
    status: str


class SponsorCreate(BaseModel):
    name: str = Field(max_length=256)
    tier: str
    logo: str | None = None


class SponsorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    tier: str
    logo: str | None


class PrizeCreate(BaseModel):
    title: str = Field(max_length=256)
    amount: str | None = None
    description: str | None = None


class PrizeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    amount: str | None
    description: str | None


class RubricSettings(BaseModel):
    innovation: int = Field(default=30, ge=1, le=100)
    technical: int = Field(default=30, ge=1, le=100)
    impact: int = Field(default=20, ge=1, le=100)
    ux: int = Field(default=10, ge=1, le=100)
    presentation: int = Field(default=10, ge=1, le=100)


class HackathonCreate(BaseModel):
    slug: str = Field(min_length=3, max_length=128, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=1, max_length=256)
    tagline: str | None = None
    description: str | None = None
    status: str = "UPCOMING"
    start_date: datetime | None = None
    end_date: datetime | None = None
    duration_hours: int = 0
    location: str | None = None
    is_online: bool = True
    prize_pool: str | None = None
    rules: list[str] = []
    faqs: list[dict] = []


class HackathonUpdate(BaseModel):
    title: str | None = None
    tagline: str | None = None
    description: str | None = None
    status: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    duration_hours: int | None = None
    location: str | None = None
    is_online: bool | None = None
    prize_pool: str | None = None
    rules: list[str] | None = None
    faqs: list[dict] | None = None


class HackathonRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    tagline: str | None
    description: str | None
    status: str
    start_date: datetime | None
    end_date: datetime | None
    duration_hours: int
    location: str | None
    is_online: bool
    prize_pool: str | None
    participants_count: int
    teams_count: int
    submission_rate: int
    judging_rate: int
    active_teams_count: int
    rules: list[str]
    faqs: list[dict]
    organization_id: uuid.UUID | None
    owner_id: uuid.UUID | None
    created_at: datetime


class HackathonDetail(HackathonRead):
    tracks: list[TrackRead] = []
    timeline: list[TimelinePhaseRead] = []
    prizes: list[PrizeRead] = []
    sponsors: list[SponsorRead] = []
    rubric: RubricSettings | None = None
