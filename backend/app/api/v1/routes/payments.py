from typing import Annotated

from fastapi import APIRouter, Depends, Header, Request

from app.api.deps import CurrentUser, SessionDep
from app.core.rate_limit import AppRateLimiter
from app.schemas.payment import (
    PaymentOrderCreate,
    PaymentOrderRead,
    PaymentVerifyCreate,
    PaymentVerifyRead,
)
from app.services.payments import PaymentService

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post(
    "/orders",
    response_model=PaymentOrderRead,
    status_code=201,
    dependencies=[Depends(AppRateLimiter("public"))],
)
async def create_order(
    payload: PaymentOrderCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> PaymentOrderRead:
    order = await PaymentService(session).create_order(current_user, payload)
    return PaymentOrderRead(**order)


@router.post("/verify", response_model=PaymentVerifyRead)
async def verify_payment(
    payload: PaymentVerifyCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> PaymentVerifyRead:
    registration = await PaymentService(session).verify_payment(current_user, payload)
    return PaymentVerifyRead(
        status=registration.status,
        payment_status=registration.payment_status,
        registration_id=registration.id,
    )


@router.post("/webhook", status_code=200)
async def razorpay_webhook(
    request: Request,
    session: SessionDep,
    signature: Annotated[str, Header(alias="X-Razorpay-Signature")],
) -> dict[str, str]:
    payload = await request.body()
    event = await PaymentService(session).handle_webhook(payload, signature)
    return {"status": "ok", "event": event}
