import uuid

from pydantic import BaseModel, Field


class PaymentOrderCreate(BaseModel):
    hackathon_id: uuid.UUID
    team_name: str | None = None
    track: str | None = None
    team_size: int = Field(default=1, ge=1, le=5)
    amount_inr: float = Field(gt=0, le=1_000_000)
    name: str
    email: str


class PaymentOrderRead(BaseModel):
    order_id: str
    amount_inr: float
    currency: str
    key_id: str
    registration_id: uuid.UUID


class PaymentVerifyCreate(BaseModel):
    order_id: str
    payment_id: str
    signature: str


class PaymentVerifyRead(BaseModel):
    status: str
    payment_status: str
    registration_id: uuid.UUID
