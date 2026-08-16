"""Payout engine schemas: prize tiers, allocations, and disbursement confirmations."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class PrizeTierRead(BaseModel):
    id: uuid.UUID
    hackathon_id: uuid.UUID
    title: str
    amount: str | None
    description: str | None
    rank: int | None
    status: str = "ACTIVE"


class PayoutAllocationRead(BaseModel):
    id: uuid.UUID
    tier_id: uuid.UUID
    tier_title: str
    rank: int | None
    team_id: uuid.UUID
    team_name: str
    team_slug: str
    amount: str | None
    status: str
    disbursed_at: datetime | None = None
    note: str | None = None


class PayoutSummaryRead(BaseModel):
    prize_pool: str | None
    prize_pool_value: int
    disbursed_value: int
    pending_value: int
    tiers_count: int
    allocated_count: int
    disbursed_count: int
    pending_count: int


class PayoutPlanRead(BaseModel):
    hackathon_id: uuid.UUID
    hackathon_title: str
    hackathon_status: str
    tiers: list[PrizeTierRead]
    allocations: list[PayoutAllocationRead]
    summary: PayoutSummaryRead


class PayoutConfirmRequest(BaseModel):
    tier_id: uuid.UUID
    team_id: uuid.UUID
    note: str | None = Field(default=None, max_length=500)


class PayoutConfirmRead(BaseModel):
    allocation: PayoutAllocationRead
    summary: PayoutSummaryRead
