"""Anti-cheat heuristics for hackathon submissions.

Phase 4 differentiator. Plagiarism pairs and activity anomalies are computed
in-process with only the standard library (``re``, ``difflib``) on top of the
existing submission read path — no new dependencies, no new tables, no
migration. Organizer verdicts are kept in a process-local store (no schema
change); this is a review aid, not a persisted audit trail.
"""

import re
import uuid
from datetime import UTC, datetime
from difflib import SequenceMatcher
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationError
from app.models.submission import Submission
from app.models.team import Team
from app.repositories.hackathon import HackathonRepository
from app.services.submission import SubmissionService

TOKEN_PATTERN = re.compile(r"[a-z0-9]+")

_STOPWORD_TEXT = (
    "a about after also am an and any app application are as at be been but "
    "build built by can could data demo did do does for from hackathon has have "
    "he help her his how i if in into is it its just like make may me more most "
    "my new no not of on one or our out over platform project see she should so "
    "some solution system that the their them then there these they this those "
    "through time to tool up us use used using very want was we were what when "
    "where which who why will with would you your"
)
STOPWORDS = frozenset(_STOPWORD_TEXT.split())

MIN_REPORT_SCORE = 40.0
HIGH_RISK_THRESHOLD = 75.0
MEDIUM_RISK_THRESHOLD = 55.0
SEQUENCE_WEIGHT = 0.6
JACCARD_WEIGHT = 0.4

IDENTICAL_TIMESTAMP_WINDOW_S = 1.0
SUBMISSION_BURST_WINDOW_S = 30.0
LAST_MINUTE_WINDOW_S = 1800.0

VALID_VERDICTS = ("PENDING", "CLEAN", "PLAGIARIZED", "FLAGGED")
_SEVERITY_RANK = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}

# Process-local verdict store, keyed by canonical pair key.
_VERDICTS: dict[str, dict[str, Any]] = {}


def tokenize(text: str | None) -> list[str]:
    """Split text into lowercased alphanumeric tokens minus stopwords."""
    tokens = TOKEN_PATTERN.findall((text or "").lower())
    return [token for token in tokens if token not in STOPWORDS and len(token) > 1]


def _document_for(submission: Submission) -> str:
    parts = [submission.project_name, submission.tagline, submission.description, " ".join(submission.tech_stack)]
    return " ".join(part for part in parts if part)


def _pair_key(submission_a_id: uuid.UUID | str, submission_b_id: uuid.UUID | str) -> str:
    first, second = sorted((str(submission_a_id), str(submission_b_id)))
    return f"{first}:{second}"


def _severity_for(score: float) -> str:
    if score >= HIGH_RISK_THRESHOLD:
        return "HIGH"
    if score >= MEDIUM_RISK_THRESHOLD:
        return "MEDIUM"
    return "LOW"


def _team_name(teams: dict[uuid.UUID, Team], team_id: uuid.UUID) -> str:
    team = teams.get(team_id)
    return team.name if team is not None else str(team_id)


def _as_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


class AnticheatService:
    """Plagiarism + timing-anomaly review for a single hackathon."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._submission_service = SubmissionService(session)
        self._hackathon_repo = HackathonRepository(session)

    async def build_report(self, hackathon_id: str) -> dict[str, Any]:
        submissions = [
            sub for sub in await self._submission_service.list_by_hackathon(hackathon_id) if sub.status != "DRAFT"
        ]
        teams = await self._teams_by_id(hackathon_id)
        hackathon = await self._hackathon_repo.get_by_id(hackathon_id)
        return {
            "hackathon_id": str(hackathon_id),
            "generated_at": datetime.now(UTC).isoformat(),
            "submissions_scanned": len(submissions),
            "pairs": self._similarity_pairs(submissions, teams),
            "anomalies": self._activity_anomalies(submissions, teams, hackathon.end_date if hackathon else None),
        }

    async def _teams_by_id(self, hackathon_id: str) -> dict[uuid.UUID, Team]:
        result = await self._session.execute(select(Team).where(Team.hackathon_id == uuid.UUID(str(hackathon_id))))
        return {team.id: team for team in result.scalars().all()}

    def _similarity_pairs(self, submissions: list[Submission], teams: dict[uuid.UUID, Team]) -> list[dict[str, Any]]:
        entries = []
        for sub in submissions:
            tokens = tokenize(_document_for(sub))
            if not tokens:
                continue
            entries.append((sub, set(tokens), tokens))

        pairs: list[dict[str, Any]] = []
        for i in range(len(entries)):
            sub_a, set_a, tokens_a = entries[i]
            for j in range(i + 1, len(entries)):
                sub_b, set_b, tokens_b = entries[j]
                union = set_a | set_b
                if not union:
                    continue
                jaccard = len(set_a & set_b) / len(union)
                sequence = SequenceMatcher(None, tokens_a, tokens_b).ratio()
                score = round(100 * (SEQUENCE_WEIGHT * sequence + JACCARD_WEIGHT * jaccard), 1)
                if score < MIN_REPORT_SCORE:
                    continue
                pairs.append(self._pair_payload(sub_a, sub_b, teams, jaccard, sequence, score))

        pairs.sort(key=lambda pair: pair["similarity_score"], reverse=True)
        return pairs

    def _pair_payload(
        self,
        sub_a: Submission,
        sub_b: Submission,
        teams: dict[uuid.UUID, Team],
        jaccard: float,
        sequence: float,
        score: float,
    ) -> dict[str, Any]:
        verdict = self.get_verdict(sub_a.id, sub_b.id) or {}
        return {
            "id": _pair_key(sub_a.id, sub_b.id),
            "submission_a_id": str(sub_a.id),
            "submission_a_team_id": str(sub_a.team_id),
            "submission_a_team_name": _team_name(teams, sub_a.team_id),
            "submission_a_project": sub_a.project_name,
            "submission_b_id": str(sub_b.id),
            "submission_b_team_id": str(sub_b.team_id),
            "submission_b_team_name": _team_name(teams, sub_b.team_id),
            "submission_b_project": sub_b.project_name,
            "jaccard_similarity": round(jaccard, 3),
            "sequence_similarity": round(sequence, 3),
            "similarity_score": score,
            "severity": _severity_for(score),
            "verdict": verdict.get("verdict", "PENDING"),
            "notes": verdict.get("notes"),
            "reviewed_at": verdict.get("reviewed_at"),
        }

    def _activity_anomalies(
        self,
        submissions: list[Submission],
        teams: dict[uuid.UUID, Team],
        end_date: datetime | None,
    ) -> list[dict[str, Any]]:
        flags: dict[uuid.UUID, dict[str, tuple[str, str]]] = {}

        def add_flag(sub_id: uuid.UUID, reason: str, severity: str, detail: str) -> None:
            current = flags.setdefault(sub_id, {})
            existing = current.get(reason)
            if existing is None or _SEVERITY_RANK[severity] > _SEVERITY_RANK[existing[0]]:
                current[reason] = (severity, detail)

        for i in range(len(submissions)):
            for j in range(i + 1, len(submissions)):
                sub_a, sub_b = submissions[i], submissions[j]
                ts_a, ts_b = _as_utc(sub_a.submitted_at), _as_utc(sub_b.submitted_at)
                if ts_a is None or ts_b is None:
                    continue
                delta = abs((ts_a - ts_b).total_seconds())
                if delta <= IDENTICAL_TIMESTAMP_WINDOW_S:
                    add_flag(
                        sub_a.id,
                        "identical_timestamp",
                        "HIGH",
                        f"Submitted {delta:.0f}s from {_team_name(teams, sub_b.team_id)}",
                    )
                    add_flag(
                        sub_b.id,
                        "identical_timestamp",
                        "HIGH",
                        f"Submitted {delta:.0f}s from {_team_name(teams, sub_a.team_id)}",
                    )
                elif delta <= SUBMISSION_BURST_WINDOW_S:
                    add_flag(
                        sub_a.id,
                        "burst_submission",
                        "MEDIUM",
                        f"Submitted {delta:.0f}s from {_team_name(teams, sub_b.team_id)}",
                    )
                    add_flag(
                        sub_b.id,
                        "burst_submission",
                        "MEDIUM",
                        f"Submitted {delta:.0f}s from {_team_name(teams, sub_a.team_id)}",
                    )

        anomalies: list[dict[str, Any]] = []
        for sub in submissions:
            submitted_at = _as_utc(sub.submitted_at)
            if submitted_at is not None and end_date is not None:
                deadline = _as_utc(end_date)
                if deadline is not None:
                    seconds_left = (deadline - submitted_at).total_seconds()
                    if seconds_left < 0:
                        add_flag(
                            sub.id,
                            "submitted_after_deadline",
                            "HIGH",
                            f"Submitted {abs(seconds_left) / 60:.0f} min after deadline",
                        )
                    elif seconds_left <= LAST_MINUTE_WINDOW_S:
                        add_flag(
                            sub.id,
                            "last_minute_submission",
                            "LOW",
                            f"Submitted {seconds_left / 60:.0f} min before deadline",
                        )
            for reason, (severity, detail) in flags.get(sub.id, {}).items():
                anomalies.append(
                    {
                        "submission_id": str(sub.id),
                        "team_id": str(sub.team_id),
                        "team_name": _team_name(teams, sub.team_id),
                        "project_name": sub.project_name,
                        "reason": reason,
                        "severity": severity,
                        "detail": detail,
                        "submitted_at": submitted_at.isoformat() if submitted_at is not None else None,
                    }
                )

        anomalies.sort(key=lambda anomaly: _SEVERITY_RANK.get(anomaly["severity"], 0), reverse=True)
        return anomalies

    def get_verdict(self, submission_a_id: uuid.UUID | str, submission_b_id: uuid.UUID | str) -> dict[str, Any] | None:
        return _VERDICTS.get(_pair_key(submission_a_id, submission_b_id))

    def set_verdict(
        self,
        submission_a_id: uuid.UUID | str,
        submission_b_id: uuid.UUID | str,
        verdict: str,
        notes: str | None,
        reviewer_id: str | uuid.UUID,
    ) -> dict[str, Any]:
        if verdict not in VALID_VERDICTS:
            raise ValidationError(f"verdict must be one of {', '.join(VALID_VERDICTS)}")
        key = _pair_key(submission_a_id, submission_b_id)
        if verdict == "PENDING":
            _VERDICTS.pop(key, None)
            return {
                "submission_a_id": str(submission_a_id),
                "submission_b_id": str(submission_b_id),
                "verdict": "PENDING",
                "notes": None,
                "reviewed_by": None,
                "reviewed_at": None,
            }
        record: dict[str, Any] = {
            "submission_a_id": str(submission_a_id),
            "submission_b_id": str(submission_b_id),
            "verdict": verdict,
            "notes": notes,
            "reviewed_by": str(reviewer_id),
            "reviewed_at": datetime.now(UTC).isoformat(),
        }
        _VERDICTS[key] = record
        return record
