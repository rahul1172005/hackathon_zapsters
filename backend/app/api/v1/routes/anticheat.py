import uuid
from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict, Field

from app.api.deps import SessionDep, require_roles
from app.models.user import User
from app.services.anticheat import AnticheatService

router = APIRouter(prefix="/anticheat", tags=["anticheat"])

Organizer = Annotated[User, Depends(require_roles("organizer", "admin"))]


class VerdictPayload(BaseModel):
    submission_a_id: uuid.UUID
    submission_b_id: uuid.UUID
    verdict: Literal["PENDING", "CLEAN", "PLAGIARIZED", "FLAGGED"]
    notes: str | None = Field(default=None, max_length=2000)


class VerdictRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    submission_a_id: uuid.UUID
    submission_b_id: uuid.UUID
    verdict: str
    notes: str | None
    reviewed_by: str | None
    reviewed_at: str | None


@router.get("/report")
async def anticheat_report(hackathon_id: str, session: SessionDep, _organizer: Organizer) -> dict:
    return await AnticheatService(session).build_report(hackathon_id)


@router.post("/verdict", response_model=VerdictRead)
async def submit_verdict(payload: VerdictPayload, session: SessionDep, _organizer: Organizer) -> VerdictRead:
    record = AnticheatService(session).set_verdict(
        payload.submission_a_id,
        payload.submission_b_id,
        payload.verdict,
        payload.notes,
        _organizer.id,
    )
    return VerdictRead.model_validate(record)
