from fastapi import APIRouter, Response, status

from app.api.deps import CurrentUser, SessionDep
from app.core.exceptions import NotFoundError
from app.schemas.notification import NotificationRead, NotificationSummary
from app.services.notification import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationRead])
async def list_notifications(session: SessionDep, current_user: CurrentUser) -> list[NotificationRead]:
    notifications = await NotificationService(session).list_for_user(current_user.id)
    return [NotificationRead.model_validate(n) for n in notifications]


@router.get("/summary", response_model=NotificationSummary)
async def get_notification_summary(session: SessionDep, current_user: CurrentUser) -> NotificationSummary:
    return await NotificationService(session).summary(current_user.id)


@router.post("/{notification_id}/read", response_model=NotificationRead)
async def mark_notification_read(
    notification_id: str, session: SessionDep, current_user: CurrentUser
) -> NotificationRead:
    notification = await NotificationService(session).mark_read(notification_id, current_user.id)
    if notification is None:
        raise NotFoundError()
    return NotificationRead.model_validate(notification)


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_read(session: SessionDep, current_user: CurrentUser) -> Response:
    await NotificationService(session).mark_all_read(current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
