from sqlalchemy import select

from app.models.hackathon import Hackathon
from app.models.prize import Prize
from app.models.sponsor import Sponsor
from app.models.timeline_phase import TimelinePhase
from app.models.track import Track
from app.repositories.base import BaseRepository


class HackathonRepository(BaseRepository):
    model = Hackathon

    async def get_by_slug(self, slug: str) -> Hackathon | None:
        result = await self._session.execute(select(Hackathon).where(Hackathon.slug == slug))
        return result.scalar_one_or_none()

    async def get_tracks(self, hackathon_id) -> list[Track]:
        result = await self._session.execute(
            select(Track).where(Track.hackathon_id == hackathon_id).order_by(Track.name)
        )
        return list(result.scalars().all())

    async def get_timeline(self, hackathon_id) -> list[TimelinePhase]:
        result = await self._session.execute(
            select(TimelinePhase).where(TimelinePhase.hackathon_id == hackathon_id).order_by(TimelinePhase.name)
        )
        return list(result.scalars().all())

    async def get_prizes(self, hackathon_id) -> list[Prize]:
        result = await self._session.execute(
            select(Prize).where(Prize.hackathon_id == hackathon_id).order_by(Prize.title)
        )
        return list(result.scalars().all())

    async def get_sponsors(self, hackathon_id) -> list[Sponsor]:
        result = await self._session.execute(
            select(Sponsor).where(Sponsor.hackathon_id == hackathon_id).order_by(Sponsor.tier)
        )
        return list(result.scalars().all())
