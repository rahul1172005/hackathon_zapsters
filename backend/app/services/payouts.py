"""Prize payout engine.

Computes per-hackathon prize tiers and payout allocations from the final
leaderboard ranking, tracks each allocation as PENDING or DISBURSED, and
exposes a manual admin confirmation flow.

Disbursement confirmations live in an in-process ledger (a class variable)
because this phase adds no database tables or migrations. The ledger is
process-local; a persistent payment table can replace it later without
changing the route contract.
"""

import re
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import ClassVar

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.models.hackathon import Hackathon
from app.models.team import Team
from app.models.user import User
from app.repositories.hackathon import HackathonRepository
from app.repositories.team import TeamRepository
from app.schemas.payout import (
    PayoutAllocationRead,
    PayoutConfirmRead,
    PayoutConfirmRequest,
    PayoutPlanRead,
    PayoutSummaryRead,
    PrizeTierRead,
)
from app.services.leaderboard import LeaderboardService

PAYOUT_PENDING = "PENDING"
PAYOUT_DISBURSED = "DISBURSED"
TIER_STATUS_ACTIVE = "ACTIVE"

_ORDINAL_WORDS: dict[str, int] = {
    "first": 1,
    "second": 2,
    "third": 3,
    "fourth": 4,
    "fifth": 5,
    "sixth": 6,
}


def parse_amount(amount: str | None) -> tuple[str | None, int | None]:
    """Return (display string, normalised numeric value) for a prize amount."""
    if not amount:
        return None, None
    digits = re.sub(r"[^0-9]", "", amount)
    if not digits:
        return amount, None
    return amount, int(digits)


def derive_rank(title: str) -> int | None:
    """Infer the leaderboard rank a prize tier is tied to from its title.

    Returns None for special awards (track prizes, community choice, etc.)
    that are not bound to an overall leaderboard position.
    """
    text = re.sub(r"\s+", " ", title.lower())
    for word, rank in _ORDINAL_WORDS.items():
        if re.search(rf"\b{word}\b.*\b(?:place|position|winner)\b", text):
            return rank
    numeric = re.search(r"\b(\d{1,2})(?:st|nd|rd|th)\b.*\b(?:place|position)\b", text)
    if numeric:
        return int(numeric.group(1))
    for word, rank in _ORDINAL_WORDS.items():
        if re.search(rf"\b{word}\b.*\brunner", text):
            return rank + 1
    if "grand" in text and "winner" in text:
        return 1
    if re.search(r"\bwinner\b", text):
        return 1
    return None


@dataclass(frozen=True)
class _Tier:
    prize_id: uuid.UUID
    hackathon_id: uuid.UUID
    title: str
    amount: str | None
    amount_value: int | None
    description: str | None
    rank: int | None


@dataclass(frozen=True)
class _Disbursement:
    disbursed_at: datetime
    note: str | None
    confirmed_by: str
    tier_title: str
    amount: str | None
    rank: int | None
    team_name: str
    team_slug: str


class PayoutService:
    _ledger: ClassVar[dict[tuple[uuid.UUID, uuid.UUID, uuid.UUID], _Disbursement]] = {}

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._hackathon_repo = HackathonRepository(session)
        self._team_repo = TeamRepository(session)

    async def plan(self, user: User, hackathon_id: str) -> PayoutPlanRead:
        hackathon = await self._get_hackathon(hackathon_id)
        self._ensure_admin(hackathon, user)
        return await self._build_plan(hackathon)

    async def confirm(self, user: User, hackathon_id: str, payload: PayoutConfirmRequest) -> PayoutConfirmRead:
        hackathon = await self._get_hackathon(hackathon_id)
        self._ensure_admin(hackathon, user)
        if settings.PAYOUT_REQUIRE_COMPLETED and hackathon.status != "COMPLETED":
            raise ConflictError("Payouts can only be confirmed once the hackathon is COMPLETED")
        tiers = await self._tiers(hackathon)
        tier = next((t for t in tiers if t.prize_id == payload.tier_id), None)
        if tier is None:
            raise NotFoundError("Prize tier not found for this hackathon")
        team = await self._team_repo.get_by_id(payload.team_id)
        if team is None or team.hackathon_id != hackathon.id:
            raise NotFoundError("Team not found in this hackathon")
        key = (hackathon.id, tier.prize_id, team.id)
        if key in self._ledger:
            raise ConflictError("This payout allocation is already disbursed")
        self._ledger[key] = _Disbursement(
            disbursed_at=datetime.now(UTC),
            note=payload.note,
            confirmed_by=str(user.id),
            tier_title=tier.title,
            amount=tier.amount,
            rank=tier.rank,
            team_name=team.name,
            team_slug=team.slug,
        )
        plan = await self._build_plan(hackathon)
        allocation = next(
            (a for a in plan.allocations if a.tier_id == tier.prize_id and a.team_id == team.id),
            None,
        )
        if allocation is None:
            raise ConflictError("Could not rebuild the confirmed allocation")
        return PayoutConfirmRead(allocation=allocation, summary=plan.summary)

    async def _build_plan(self, hackathon: Hackathon) -> PayoutPlanRead:
        tiers = await self._tiers(hackathon)
        standings = await LeaderboardService(self._session).standings(str(hackathon.id))
        allocations = self._merge_ledger(hackathon, tiers, self._auto_allocations(hackathon, tiers, standings))
        return PayoutPlanRead(
            hackathon_id=hackathon.id,
            hackathon_title=hackathon.title,
            hackathon_status=hackathon.status,
            tiers=[self._tier_read(tier) for tier in tiers],
            allocations=allocations,
            summary=self._summary(hackathon, tiers, allocations),
        )

    async def _tiers(self, hackathon: Hackathon) -> list[_Tier]:
        prizes = await self._hackathon_repo.get_prizes(hackathon.id)
        tiers = [
            _Tier(
                prize_id=prize.id,
                hackathon_id=hackathon.id,
                title=prize.title,
                amount=prize.amount,
                amount_value=parse_amount(prize.amount)[1],
                description=prize.description,
                rank=derive_rank(prize.title),
            )
            for prize in prizes
        ]
        ranked = sorted(
            (t for t in tiers if t.rank is not None),
            key=lambda t: (t.rank or 0, -(t.amount_value or 0), t.title.lower()),
        )
        unranked = sorted(
            (t for t in tiers if t.rank is None),
            key=lambda t: (-(t.amount_value or 0), t.title.lower()),
        )
        return [*ranked, *unranked]

    def _auto_allocations(
        self, hackathon: Hackathon, tiers: list[_Tier], standings: list[Team]
    ) -> list[PayoutAllocationRead]:
        by_rank = {team.rank: team for team in standings if team.rank > 0}
        allocations: list[PayoutAllocationRead] = []
        for tier in tiers:
            if tier.rank is None or tier.rank > settings.PAYOUT_MAX_TIERS:
                continue
            team = by_rank.get(tier.rank)
            if team is None:
                continue
            allocations.append(self._allocation_read(hackathon, tier, team))
        return allocations

    def _allocation_read(self, hackathon: Hackathon, tier: _Tier, team: Team) -> PayoutAllocationRead:
        entry = self._ledger.get((hackathon.id, tier.prize_id, team.id))
        return PayoutAllocationRead(
            id=uuid.uuid5(uuid.NAMESPACE_OID, f"{hackathon.id}:{tier.prize_id}:{team.id}"),
            tier_id=tier.prize_id,
            tier_title=tier.title,
            rank=tier.rank,
            team_id=team.id,
            team_name=team.name,
            team_slug=team.slug,
            amount=tier.amount,
            status=PAYOUT_DISBURSED if entry is not None else PAYOUT_PENDING,
            disbursed_at=entry.disbursed_at if entry is not None else None,
            note=entry.note if entry is not None else None,
        )

    def _merge_ledger(
        self,
        hackathon: Hackathon,
        tiers: list[_Tier],
        auto: list[PayoutAllocationRead],
    ) -> list[PayoutAllocationRead]:
        merged = list(auto)
        seen = {(a.tier_id, a.team_id) for a in auto}
        for (hack_id, tier_id, team_id), entry in self._ledger.items():
            if hack_id != hackathon.id or (tier_id, team_id) in seen:
                continue
            if not any(t.prize_id == tier_id for t in tiers):
                continue
            merged.append(
                PayoutAllocationRead(
                    id=uuid.uuid5(uuid.NAMESPACE_OID, f"{hackathon.id}:{tier_id}:{team_id}"),
                    tier_id=tier_id,
                    tier_title=entry.tier_title,
                    rank=entry.rank,
                    team_id=team_id,
                    team_name=entry.team_name,
                    team_slug=entry.team_slug,
                    amount=entry.amount,
                    status=PAYOUT_DISBURSED,
                    disbursed_at=entry.disbursed_at,
                    note=entry.note,
                )
            )
        return merged

    def _summary(
        self,
        hackathon: Hackathon,
        tiers: list[_Tier],
        allocations: list[PayoutAllocationRead],
    ) -> PayoutSummaryRead:
        disbursed = [a for a in allocations if a.status == PAYOUT_DISBURSED]
        pending = [a for a in allocations if a.status == PAYOUT_PENDING]
        return PayoutSummaryRead(
            prize_pool=hackathon.prize_pool,
            prize_pool_value=sum(t.amount_value or 0 for t in tiers),
            disbursed_value=sum(parse_amount(a.amount)[1] or 0 for a in disbursed),
            pending_value=sum(parse_amount(a.amount)[1] or 0 for a in pending),
            tiers_count=len(tiers),
            allocated_count=len(allocations),
            disbursed_count=len(disbursed),
            pending_count=len(pending),
        )

    @staticmethod
    def _tier_read(tier: _Tier) -> PrizeTierRead:
        return PrizeTierRead(
            id=tier.prize_id,
            hackathon_id=tier.hackathon_id,
            title=tier.title,
            amount=tier.amount,
            description=tier.description,
            rank=tier.rank,
            status=TIER_STATUS_ACTIVE,
        )

    async def _get_hackathon(self, hackathon_id: str) -> Hackathon:
        hackathon = await self._hackathon_repo.get_by_id(str(hackathon_id))
        if hackathon is None:
            hackathon = await self._hackathon_repo.get_by_slug(str(hackathon_id))
        if hackathon is None:
            raise NotFoundError("Hackathon not found")
        return hackathon

    @staticmethod
    def _ensure_admin(hackathon: Hackathon, user: User) -> None:
        if user.is_superuser:
            return
        if hackathon.owner_id is not None and hackathon.owner_id != user.id:
            raise ForbiddenError("Only the hackathon owner or an admin may manage payouts")
