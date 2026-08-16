"""Live public judging broadcast (Server-Sent Events).

Streams public judging events for a hackathon (submission presented, scores
revealed for public criteria) by polling the submission, evaluation, and team
tables through the existing read services. Dependency-light: no new
dependencies, plain asyncio polling with the text/event-stream wire format.
"""

import asyncio
import json
import time
from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.api.deps import SessionDep
from app.core.exceptions import NotFoundError
from app.core.rate_limit import AppRateLimiter
from app.services.evaluation import EvaluationService
from app.services.hackathon import HackathonService
from app.services.judge import JudgeService
from app.services.submission import SubmissionService
from app.services.team import TeamService

router = APIRouter(prefix="/broadcast", tags=["broadcast"])

POLL_INTERVAL_SECONDS = 5.0
HEARTBEAT_INTERVAL_SECONDS = 20.0
STANDINGS_INTERVAL_SECONDS = 15.0
MAX_CRITERIA_LOOKUPS_PER_POLL = 240

PUBLIC_CRITERIA = ("innovation", "technical", "impact", "ux", "presentation")
CRITERIA_LABELS = {
    "innovation": "Innovation",
    "technical": "Technical",
    "impact": "Impact",
    "ux": "UX",
    "presentation": "Presentation",
}
DEFAULT_RUBRIC = {"innovation": 30, "technical": 30, "impact": 20, "ux": 10, "presentation": 10}


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def _sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, default=str)}\n\n"


def _submission_payload(submission: Any, team: Any | None) -> dict[str, Any]:
    return {
        "id": str(submission.id),
        "team_id": str(submission.team_id),
        "team_name": team.name if team is not None else None,
        "team_slug": team.slug if team is not None else None,
        "track": submission.track,
        "project_name": submission.project_name,
        "tagline": submission.tagline,
        "status": submission.status,
        "evaluation_count": submission.evaluation_count,
        "average_score": submission.average_score,
    }


def _public_rubric(rubric: dict[str, Any] | None) -> dict[str, int]:
    merged = dict(DEFAULT_RUBRIC)
    if rubric:
        for key, value in rubric.items():
            if key in PUBLIC_CRITERIA and isinstance(value, (int, float)):
                merged[key] = int(value)
    return merged


def _score_changed(previous: dict[str, Any], current: dict[str, Any]) -> bool:
    return (
        previous["average_score"] != current["average_score"]
        or previous["evaluation_count"] != current["evaluation_count"]
    )


async def _poll_state(session: SessionDep, hackathon_id: str) -> dict[str, Any]:
    hackathon = await HackathonService(session).get_by_id(hackathon_id)
    submissions = await SubmissionService(session).list_by_hackathon(hackathon_id)
    teams = await TeamService(session).list_by_hackathon(hackathon_id)
    teams_by_id = {str(team.id): team for team in teams}
    ranked = sorted(teams, key=lambda team: (team.score, team.name or ""), reverse=True)
    standings = [
        {
            "team_id": str(team.id),
            "rank": index,
            "name": team.name,
            "slug": team.slug,
            "score": team.score,
            "track": team.track,
            "status": team.status,
        }
        for index, team in enumerate(ranked, start=1)
    ]
    payloads = [_submission_payload(submission, teams_by_id.get(str(submission.team_id))) for submission in submissions]
    return {"hackathon": hackathon, "submissions": payloads, "standings": standings, "teams_by_id": teams_by_id}


async def _criteria_breakdown(
    session: SessionDep, hackathon_id: str, submissions: list[dict[str, Any]]
) -> dict[str, dict[str, Any]]:
    """Aggregate per-criterion averages from SUBMITTED evaluation rows.

    Reads only through the existing evaluation read service; the lookups are
    bounded so an oversized judging panel cannot exhaust the request.
    """
    judges = await JudgeService(session).list_by_hackathon(hackathon_id)
    if not judges:
        return {}
    evaluation_service = EvaluationService(session)
    remaining = MAX_CRITERIA_LOOKUPS_PER_POLL
    breakdown: dict[str, dict[str, Any]] = {}
    for submission in submissions:
        if remaining <= 0:
            break
        accumulated: dict[str, list[float]] = {}
        count = 0
        for judge in judges:
            if remaining <= 0:
                break
            remaining -= 1
            evaluation = await evaluation_service.get_for_judge_and_team(judge.id, submission["team_id"])
            if evaluation is not None and evaluation.status == "SUBMITTED":
                count += 1
                for criterion, value in evaluation.scores.items():
                    if criterion in PUBLIC_CRITERIA:
                        accumulated.setdefault(criterion, []).append(float(value))
        if count > 0:
            breakdown[submission["id"]] = {
                "criteria": {criterion: round(sum(values) / count, 2) for criterion, values in accumulated.items()},
                "count": count,
            }
    return breakdown


def _criteria_list(
    submission: dict[str, Any], rubric: dict[str, int], breakdown: dict[str, dict[str, Any]] | None
) -> list[dict[str, Any]]:
    criterion_scores = breakdown.get(submission["id"], {}).get("criteria", {}) if breakdown else {}
    return [
        {
            "key": key,
            "label": CRITERIA_LABELS.get(key, key),
            "score": criterion_scores.get(key),
            "max": rubric.get(key, DEFAULT_RUBRIC.get(key)),
        }
        for key in PUBLIC_CRITERIA
    ]


def _snapshot_payload(hackathon: Any, rubric: dict[str, int], state: dict[str, Any]) -> dict[str, Any]:
    return {
        "hackathon": {
            "id": str(hackathon.id),
            "slug": hackathon.slug,
            "title": hackathon.title,
            "tagline": hackathon.tagline,
            "status": hackathon.status,
            "judging_rate": hackathon.judging_rate,
            "submission_rate": hackathon.submission_rate,
            "teams_count": hackathon.teams_count,
            "participants_count": hackathon.participants_count,
            "prize_pool": hackathon.prize_pool,
            "location": hackathon.location,
            "start_date": hackathon.start_date,
            "end_date": hackathon.end_date,
        },
        "rubric": rubric,
        "submissions": state["submissions"],
        "standings": state["standings"],
        "judges_count": len(state.get("judges", [])),
        "stream_started_at": _now_iso(),
    }


async def _event_stream(session: SessionDep, hackathon_id: str) -> AsyncGenerator[str, None]:
    sequence = 0
    last_submissions: dict[str, dict[str, Any]] = {}
    last_standings_emitted = 0.0
    last_heartbeat = time.monotonic()
    try:
        state = await _poll_state(session, hackathon_id)
        hackathon = state["hackathon"]
        rubric = _public_rubric(hackathon.rubric)
        judges = await JudgeService(session).list_by_hackathon(hackathon_id)
        state["judges"] = judges
        breakdown = await _criteria_breakdown(session, hackathon_id, state["submissions"])
        snapshot = _snapshot_payload(hackathon, rubric, state)
        snapshot["score_breakdowns"] = breakdown
        yield _sse("snapshot", snapshot)
        sequence += 1
        last_submissions = {payload["id"]: payload for payload in state["submissions"]}
        last_standings_emitted = time.monotonic()

        while True:
            now = time.monotonic()
            if now - last_heartbeat >= HEARTBEAT_INTERVAL_SECONDS:
                last_heartbeat = now
                yield _sse("heartbeat", {"sequence": sequence, "at": _now_iso()})
                sequence += 1

            state = await _poll_state(session, hackathon_id)
            hackathon = state["hackathon"]
            rubric = _public_rubric(hackathon.rubric)
            submissions = state["submissions"]
            breakdown = await _criteria_breakdown(session, hackathon_id, submissions)
            seen_ids: set[str] = set()

            for payload in submissions:
                seen_ids.add(payload["id"])
                previous = last_submissions.get(payload["id"])
                if previous is None:
                    yield _sse("submission.presented", {"submission": payload, "presented_at": _now_iso()})
                    sequence += 1
                elif _score_changed(previous, payload):
                    yield _sse(
                        "score.revealed",
                        {
                            "submission": payload,
                            "criteria": _criteria_list(payload, rubric, breakdown),
                            "total": payload["average_score"],
                            "evaluation_count": payload["evaluation_count"],
                            "revealed_at": _now_iso(),
                        },
                    )
                    sequence += 1
                elif previous["status"] != payload["status"]:
                    yield _sse("submission.presented", {"submission": payload, "presented_at": _now_iso()})
                    sequence += 1
                last_submissions[payload["id"]] = payload

            for submission_id in set(last_submissions) - seen_ids:
                last_submissions.pop(submission_id, None)

            if time.monotonic() - last_standings_emitted >= STANDINGS_INTERVAL_SECONDS:
                last_standings_emitted = time.monotonic()
                yield _sse("standings", {"standings": state["standings"], "updated_at": _now_iso()})
                sequence += 1

            if hackathon.status == "COMPLETED":
                yield _sse("ended", {"reason": "completed", "at": _now_iso()})
                break

            await asyncio.sleep(POLL_INTERVAL_SECONDS)
    except asyncio.CancelledError:
        raise
    finally:
        await session.rollback()


@router.get("/{hackathon_id}/live", dependencies=[Depends(AppRateLimiter("public"))])
async def stream_live_broadcast(hackathon_id: str, session: SessionDep) -> StreamingResponse:
    try:
        await HackathonService(session).get_by_id(hackathon_id)
    except ValueError as exc:
        raise NotFoundError("Hackathon not found") from exc
    return StreamingResponse(
        _event_stream(session, hackathon_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
