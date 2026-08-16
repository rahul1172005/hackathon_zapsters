import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class RubricScores(BaseModel):
    innovation: int = Field(ge=0, le=100)
    technical: int = Field(ge=0, le=100)
    impact: int = Field(ge=0, le=100)
    ux: int = Field(ge=0, le=100)
    presentation: int = Field(ge=0, le=100)


class EvaluationCreate(BaseModel):
    judge_id: uuid.UUID
    team_id: uuid.UUID
    hackathon_id: uuid.UUID
    scores: RubricScores
    notes: str | None = None
    status: Literal["DRAFT", "SAVED", "SUBMITTED"] = "DRAFT"


class EvaluationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    judge_id: uuid.UUID
    judge_name: str | None = None
    team_id: uuid.UUID
    team_name: str | None = None
    hackathon_id: uuid.UUID
    scores: dict
    total_score: float
    notes: str | None
    status: str
    updated_at: datetime
