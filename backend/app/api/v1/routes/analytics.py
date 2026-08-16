from fastapi import APIRouter

from app.api.deps import SessionDep
from app.services.analytics import AnalyticsOverview, AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/{hackathon_id}/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(hackathon_id: str, session: SessionDep) -> AnalyticsOverview:
    return await AnalyticsService(session).overview(hackathon_id)
