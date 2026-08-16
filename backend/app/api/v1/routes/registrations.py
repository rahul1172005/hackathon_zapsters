from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.registration import RegistrationCreate, RegistrationRead
from app.services.registration import RegistrationService

router = APIRouter(prefix="/registrations", tags=["registrations"])


@router.get("", response_model=list[RegistrationRead])
async def list_my_registrations(session: SessionDep, current_user: CurrentUser) -> list[RegistrationRead]:
    registrations = await RegistrationService(session).list_for_user(current_user)
    return [RegistrationRead.model_validate(r) for r in registrations]


@router.post("", response_model=RegistrationRead, status_code=201)
async def register_for_hackathon(
    payload: RegistrationCreate, session: SessionDep, current_user: CurrentUser
) -> RegistrationRead:
    registration = await RegistrationService(session).register(current_user, payload)
    return RegistrationRead.model_validate(registration)


@router.post("/{registration_id}/cancel", response_model=RegistrationRead)
async def cancel_registration(registration_id: str, session: SessionDep, current_user: CurrentUser) -> RegistrationRead:
    registration = await RegistrationService(session).cancel(current_user, registration_id)
    return RegistrationRead.model_validate(registration)
