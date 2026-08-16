import hashlib
import hmac
import json
import uuid
from decimal import Decimal
from typing import Any

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.logging import get_logger
from app.models.registration import Registration
from app.models.user import User
from app.repositories.registration import RegistrationRepository
from app.schemas.payment import PaymentOrderCreate, PaymentVerifyCreate

logger = get_logger("payments")

PAID_EVENTS = {"payment.captured", "order.paid"}
FAILED_EVENTS = {"payment.failed", "order.failed"}


class PaymentNotConfiguredError(ValidationError):
    code = "payments_not_configured"


class PaymentSignatureError(ValidationError):
    code = "invalid_payment_signature"


class PaymentService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = RegistrationRepository(session)

    async def create_order(self, user: User, data: PaymentOrderCreate) -> dict[str, Any]:
        if not settings.razorpay_configured:
            raise PaymentNotConfiguredError("Razorpay is not configured on the server")
        if data.amount_inr <= 0:
            raise ValidationError("Registration amount must be greater than zero")

        existing = await self._repo.get_for_user_and_hackathon(user.id, data.hackathon_id)
        if existing is not None and existing.payment_status == "PAID":
            raise ConflictError("Already registered for this hackathon")

        if existing is None:
            registration = Registration(
                user_id=user.id,
                hackathon_id=data.hackathon_id,
                team_name=data.team_name,
                track=data.track,
                team_size=data.team_size,
                status="PENDING",
                payment_status="PENDING",
            )
            self._session.add(registration)
            await self._session.flush()
        else:
            registration = existing
            registration.team_name = data.team_name
            registration.track = data.track
            registration.team_size = data.team_size
            registration.status = "PENDING"
            registration.payment_status = "PENDING"

        amount_paise = int(Decimal(str(data.amount_inr)) * 100)
        order = await self._create_razorpay_order(
            {
                "amount": amount_paise,
                "currency": settings.RAZORPAY_CURRENCY,
                # The registration UUID doubles as the Razorpay receipt so the
                # webhook can map a payment back to a registration without any
                # schema changes (receipt is capped at 40 chars; UUID is 36).
                "receipt": str(registration.id),
                "notes": {
                    "user_id": str(user.id),
                    "hackathon_id": str(data.hackathon_id),
                    "registration_id": str(registration.id),
                    "email": data.email,
                    "name": data.name,
                },
            }
        )

        await self._session.commit()
        return {
            "order_id": order["id"],
            "amount_inr": data.amount_inr,
            "currency": settings.RAZORPAY_CURRENCY,
            "key_id": settings.RAZORPAY_KEY_ID,
            "registration_id": registration.id,
        }

    async def verify_payment(self, user: User, data: PaymentVerifyCreate) -> Registration:
        registration = await self._registration_for_order(user, data.order_id)
        secret = settings.RAZORPAY_KEY_SECRET.get_secret_value()
        expected = f"{data.order_id}|{data.payment_id}".encode()
        digest = hmac.new(secret.encode(), expected, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(digest, data.signature):
            raise PaymentSignatureError("Payment signature verification failed")
        registration.status = "CONFIRMED"
        registration.payment_status = "PAID"
        await self._session.commit()
        await self._session.refresh(registration)
        return registration

    async def handle_webhook(self, payload: bytes, signature: str) -> str:
        self.verify_webhook_signature(payload, signature)
        event = json.loads(payload)
        event_name = str(event.get("event", ""))
        receipt = str(event.get("payload", {}).get("order", {}).get("entity", {}).get("receipt", ""))
        if not receipt:
            logger.warning("razorpay webhook without an order receipt", event=event_name)
            return event_name
        try:
            registration_id = uuid.UUID(receipt)
        except ValueError:
            logger.warning("razorpay webhook receipt is not a registration id", receipt=receipt)
            return event_name
        if event_name in PAID_EVENTS:
            await self._set_payment_status(registration_id, "PAID")
        elif event_name in FAILED_EVENTS:
            await self._set_payment_status(registration_id, "FAILED")
        return event_name

    @staticmethod
    def verify_webhook_signature(payload: bytes, signature: str) -> None:
        secret = settings.RAZORPAY_WEBHOOK_SECRET.get_secret_value()
        if not secret:
            raise PaymentNotConfiguredError("Razorpay webhook secret is not configured")
        digest = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(digest, signature):
            raise PaymentSignatureError("Webhook signature verification failed")

    async def _create_razorpay_order(self, payload: dict) -> dict:
        auth = httpx.BasicAuth(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET.get_secret_value())
        async with httpx.AsyncClient(base_url=settings.RAZORPAY_API_BASE, timeout=10.0) as client:
            response = await client.post("/orders", json=payload, auth=auth)
        if response.status_code >= 400:
            logger.error("razorpay order creation failed", status_code=response.status_code)
            raise ValidationError("Payment provider rejected the order request")
        return response.json()

    async def _get_razorpay_order(self, order_id: str) -> dict:
        auth = httpx.BasicAuth(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET.get_secret_value())
        async with httpx.AsyncClient(base_url=settings.RAZORPAY_API_BASE, timeout=10.0) as client:
            response = await client.get(f"/orders/{order_id}", auth=auth)
        if response.status_code == 404:
            raise NotFoundError("Payment order not found")
        if response.status_code >= 400:
            logger.error("razorpay order lookup failed", status_code=response.status_code)
            raise ValidationError("Payment provider returned an error")
        return response.json()

    async def _registration_for_order(self, user: User, order_id: str) -> Registration:
        order = await self._get_razorpay_order(order_id)
        try:
            registration_id = uuid.UUID(str(order.get("receipt", "")))
        except ValueError:
            raise NotFoundError("Registration not found for this order") from None
        registration = await self._repo.get_by_id(str(registration_id))
        if registration is None or str(registration.user_id) != str(user.id):
            raise NotFoundError("Registration not found for this order")
        return registration

    async def _set_payment_status(self, registration_id: uuid.UUID, payment_status: str) -> None:
        registration = await self._repo.get_by_id(str(registration_id))
        if registration is None:
            logger.warning("razorpay webhook references unknown registration", registration_id=str(registration_id))
            return
        registration.payment_status = payment_status
        if payment_status == "PAID":
            registration.status = "CONFIRMED"
        await self._session.commit()
