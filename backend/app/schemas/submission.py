import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SubmissionCreate(BaseModel):
    team_id: uuid.UUID
    hackathon_id: uuid.UUID
    track: str | None = None
    project_name: str = Field(min_length=1, max_length=256)
    tagline: str | None = None
    description: str | None = None
    repo_url: str | None = None
    demo_url: str | None = None
    presentation_url: str | None = None
    tech_stack: list[str] = []


class SubmissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    team_id: uuid.UUID
    hackathon_id: uuid.UUID
    team_name: str | None = None
    team_slug: str | None = None
    track: str | None
    project_name: str
    tagline: str | None
    description: str | None
    repo_url: str | None
    demo_url: str | None
    presentation_url: str | None
    tech_stack: list[str]
    submitted_at: datetime
    status: str
    evaluation_count: int
    average_score: float


class StandingRead(BaseModel):
    """A submission enriched with its auto-scored standing.

    ``score`` is the aggregate of every submitted evaluation's criterion
    scores, each weighted by the hackathon's rubric (aggregate criterion
    scores x rubric weights). Teams without any submitted evaluation get a
    zero score and are ranked last.
    """

    submission_id: uuid.UUID
    team_id: uuid.UUID
    team_name: str | None
    team_slug: str | None
    hackathon_id: uuid.UUID
    track: str | None
    project_name: str
    tagline: str | None
    description: str | None
    repo_url: str | None
    demo_url: str | None
    presentation_url: str | None
    tech_stack: list[str]
    submitted_at: datetime
    status: str
    evaluation_count: int
    average_score: float
    score: float
    rank: int
