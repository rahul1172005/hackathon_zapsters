from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import CurrentUser, SessionDep, require_roles
from app.models.user import User
from app.schemas.payout import PayoutConfirmRead, PayoutConfirmRequest, PayoutPlanRead
from app.services.payouts import PayoutService

router = APIRouter(prefix="/hackathons/{hackathon_id}/payouts", tags=["payouts"])

AdminUser = Annotated[User, Depends(require_roles("admin"))]


@router.get("", response_model=PayoutPlanRead)
async def get_payout_plan(hackathon_id: str, session: SessionDep, current_user: CurrentUser) -> PayoutPlanRead:
    return await PayoutService(session).plan(current_user, hackathon_id)


@router.post("/confirm", response_model=PayoutConfirmRead)
async def confirm_payout(
    hackathon_id: str,
    payload: PayoutConfirmRequest,
    session: SessionDep,
    current_user: AdminUser,
) -> PayoutConfirmRead:
    return await PayoutService(session).confirm(current_user, hackathon_id, payload)
