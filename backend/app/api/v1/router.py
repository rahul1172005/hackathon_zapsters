from fastapi import APIRouter

from app.api.v1.routes import (
    announcements,
    auth,
    evaluations,
    hackathons,
    judges,
    leaderboard,
    notifications,
    organizations,
    registrations,
    submissions,
    teams,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(hackathons.router)
api_router.include_router(teams.router)
api_router.include_router(submissions.router)
api_router.include_router(evaluations.router)
api_router.include_router(judges.router)
api_router.include_router(leaderboard.router)
api_router.include_router(registrations.router)
api_router.include_router(organizations.router)
api_router.include_router(announcements.router)
api_router.include_router(notifications.router)
