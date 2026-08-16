import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    tagline: str | None
    description: str | None
    repo_url: str | None
    demo_url: str | None
    presentation_url: str | None
    tech_stack: list[str]
    screenshots: list[str]
    commits_count: int
    prs_count: int
    issues_count: int
    tasks_count: int
    active_days: int


class TeamMemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    role: str
    contribution_percentage: int


class TeamTaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    assignee_id: uuid.UUID | None
    status: str


class TeamTaskCreate(BaseModel):
    title: str = Field(max_length=512)
    assignee_id: uuid.UUID | None = None
    status: str = "TODO"


class ActivityItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    timestamp: datetime
    author: str
    action: str
    detail: str | None
    type: str


class TeamCreate(BaseModel):
    slug: str = Field(min_length=3, max_length=128, pattern=r"^[a-z0-9-]+$")
    name: str = Field(min_length=1, max_length=256)
    hackathon_id: uuid.UUID
    track: str | None = None


class TeamJoin(BaseModel):
    invite_code: str = Field(min_length=6, max_length=16)


class TeamInviteRead(BaseModel):
    team_id: uuid.UUID
    slug: str
    name: str
    invite_code: str


class TeamRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name: str
    hackathon_id: uuid.UUID
    track: str | None
    status: str
    activity_level: str
    rank: int
    score: float
    score_trend: str
    created_at: datetime


class TeamDetail(TeamRead):
    members: list[TeamMemberRead] = []
    tasks: list[TeamTaskRead] = []
    activity_log: list[ActivityItemRead] = []
    project: ProjectRead | None = None
