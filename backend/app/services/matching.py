"""Profile-based team matching.

Users opt into the matchmaking pool by posting their preferences to
``POST /matching/preferences``. The pool is held in-process because a dedicated
table is out of scope for this phase (no migration budget); the persisted half
of the profile (``user.skills``) is written through to the user row so the
directory can still rank real data after a restart.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import (
    DirectoryEntryRead,
    MatchCandidateRead,
    MatchingPreferences,
    MatchingPreferencesRead,
    UserRead,
)

# Weights for the match score: skill overlap dominates, interests and goals add
# signal. Every component is a Jaccard index in [0, 1].
SKILL_WEIGHT = 0.6
INTEREST_WEIGHT = 0.25
GOAL_WEIGHT = 0.15
# Bonus when the candidate's role/title fits a role the seeker asked for.
ROLE_MATCH_BONUS = 5.0
# Neutral bump when the seeker has not expressed any desired roles.
ROLE_NEUTRAL_BONUS = 2.0

MAX_RECOMMENDATIONS = 50

# In-process opt-in pool: user id -> preferences.
_POOL: dict[str, MatchingPreferences] = {}


class MatchingService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = UserRepository(session)
        self._session = session

    async def save_preferences(self, user: User, data: MatchingPreferences) -> MatchingPreferencesRead:
        """Opt the user into the pool, or update their existing entry."""
        _POOL[str(user.id)] = data
        if data.skills:
            # Persist the skills half of the profile on the user row.
            user.skills = data.skills
            await self._session.commit()
            await self._session.refresh(user)
        return MatchingPreferencesRead.model_validate(data)

    async def get_preferences(self, user: User) -> MatchingPreferencesRead:
        """Return the pool entry, or profile-derived defaults if not opted in."""
        return MatchingPreferencesRead.model_validate(_POOL.get(str(user.id)) or _default_preferences(user))

    def remove_preferences(self, user: User) -> None:
        """Opt the user out of the pool."""
        _POOL.pop(str(user.id), None)

    async def recommendations(self, user: User) -> list[MatchCandidateRead]:
        """Score the pool against the seeker and return the best matches."""
        seeker = _POOL.get(str(user.id)) or _default_preferences(user)
        if not seeker.seeking_team:
            return []
        results: list[MatchCandidateRead] = []
        for candidate in await self._repo.list_all():
            if candidate.id == user.id or not candidate.is_active:
                continue
            candidate_prefs = _POOL.get(str(candidate.id)) or _default_preferences(candidate)
            if not candidate_prefs.seeking_team:
                continue
            score, matched_skills, matched_interests = score_match(seeker, candidate_prefs)
            if score <= 0:
                continue
            results.append(
                MatchCandidateRead(
                    user=UserRead.model_validate(candidate),
                    score=score,
                    matched_skills=matched_skills,
                    matched_interests=matched_interests,
                )
            )
        results.sort(key=lambda item: item.score, reverse=True)
        return results[:MAX_RECOMMENDATIONS]

    async def directory(
        self,
        current_user: User,
        *,
        role: str | None = None,
        skills: str | None = None,
        query: str | None = None,
        limit: int = MAX_RECOMMENDATIONS,
    ) -> list[DirectoryEntryRead]:
        """Search/filter participants by role, skills, or free text."""
        wanted = _normalize_tags(skills)
        entries: list[DirectoryEntryRead] = []
        for candidate in await self._repo.list_all():
            if candidate.id == current_user.id or not candidate.is_active:
                continue
            if role and not _matches_role(candidate, role):
                continue
            if query and not _matches_query(candidate, query):
                continue
            entries.append(
                DirectoryEntryRead(
                    user=UserRead.model_validate(candidate),
                    matched_skills=[s for s in candidate.skills if s.lower() in wanted] if wanted else [],
                    score=_skill_overlap_score(wanted, candidate.skills) if wanted else None,
                )
            )
        entries.sort(key=lambda entry: (-(entry.score or 0), entry.user.name.lower()))
        return entries[:limit]


def _default_preferences(user: User) -> MatchingPreferences:
    return MatchingPreferences(skills=list(user.skills), title=user.title)


def _normalize_tags(values: str | None) -> set[str]:
    if not values:
        return set()
    return {part.strip().lower() for part in values.split(",") if part.strip()}


def _matches_role(user: User, role: str) -> bool:
    needle = role.strip().lower()
    haystacks = [user.title or "", *user.roles]
    return any(needle in h.lower() for h in haystacks)


def _matches_query(user: User, query: str) -> bool:
    needle = query.strip().lower()
    haystacks = [user.name, user.username, user.bio or "", user.title or ""]
    return any(needle in h.lower() for h in haystacks)


def _jaccard(a: set[str], b: set[str]) -> float:
    union = a | b
    if not union:
        return 0.0
    return len(a & b) / len(union)


def _skill_overlap_score(wanted: set[str], skills: list[str]) -> int:
    candidate = {s.lower() for s in skills}
    return round(_jaccard(wanted, candidate) * 100)


def score_match(a: MatchingPreferences, b: MatchingPreferences) -> tuple[int, list[str], list[str]]:
    """Score candidate ``b`` against seeker ``a`` by profile overlap."""
    a_skills = {s.lower().strip() for s in a.skills}
    b_skills = {s.lower().strip() for s in b.skills}
    a_interests = {i.lower().strip() for i in a.interests}
    b_interests = {i.lower().strip() for i in b.interests}
    a_goals = {g.lower().strip() for g in a.goals}
    b_goals = {g.lower().strip() for g in b.goals}

    base = 100.0 * (
        SKILL_WEIGHT * _jaccard(a_skills, b_skills)
        + INTEREST_WEIGHT * _jaccard(a_interests, b_interests)
        + GOAL_WEIGHT * _jaccard(a_goals, b_goals)
    )
    bonus = _role_bonus(a, b)
    return (
        round(min(100.0, base + bonus)),
        sorted({s for s in b.skills if s.lower().strip() in a_skills}),
        sorted({i for i in b.interests if i.lower().strip() in a_interests}),
    )


def _role_bonus(a: MatchingPreferences, b: MatchingPreferences) -> float:
    desired = {r.lower().strip() for r in a.desired_roles}
    candidate_roles = {r.lower().strip() for r in b.desired_roles}
    if b.title:
        candidate_roles.add(b.title.lower().strip())
    if desired and candidate_roles:
        return ROLE_MATCH_BONUS if desired & candidate_roles else 0.0
    return ROLE_NEUTRAL_BONUS
