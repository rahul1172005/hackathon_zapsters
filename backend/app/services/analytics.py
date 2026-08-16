import uuid
from datetime import UTC, date, datetime

from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.registration import Registration
from app.repositories.hackathon import HackathonRepository
from app.repositories.judge import EvaluationRepository, JudgeRepository
from app.repositories.registration import RegistrationRepository
from app.repositories.submission import SubmissionRepository
from app.repositories.team import TeamRepository

SUBMITTED_SUBMISSION_STATUSES = frozenset({"SUBMITTED", "UNDER_REVIEW", "EVALUATED"})

SCORE_BUCKETS = (
    ("90-100", 90.0, 100.0),
    ("80-89", 80.0, 90.0),
    ("70-79", 70.0, 80.0),
    ("60-69", 60.0, 70.0),
    ("<60", 0.0, 60.0),
)


class RegistrationDayPoint(BaseModel):
    date: date
    count: int


class StatusCount(BaseModel):
    status: str
    count: int


class ScoreBucket(BaseModel):
    range: str
    count: int


class CommitVelocityPoint(BaseModel):
    time: str
    commits: int
    prs: int


class EngagementMetrics(BaseModel):
    activity_events: int
    total_commits: int
    total_prs: int
    total_issues: int
    total_tasks: int
    commit_velocity: list[CommitVelocityPoint]


class AnalyticsSummary(BaseModel):
    total_registrations: int
    participants_count: int
    teams_count: int
    active_teams_count: int
    total_submissions: int
    submitted_submissions: int
    submission_rate: float
    evaluated_teams_count: int
    evaluations_submitted: int
    evaluations_saved: int
    average_score: float
    judges_count: int
    evaluations_completed: int
    evaluations_remaining: int


class AnalyticsOverview(BaseModel):
    hackathon_id: str
    hackathon_title: str
    generated_at: datetime
    summary: AnalyticsSummary
    registrations_by_day: list[RegistrationDayPoint]
    submissions_by_status: list[StatusCount]
    score_distribution: list[ScoreBucket]
    evaluation_status_distribution: list[StatusCount]
    engagement: EngagementMetrics


class AnalyticsService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._hackathon_repo = HackathonRepository(session)
        self._registration_repo = RegistrationRepository(session)
        self._submission_repo = SubmissionRepository(session)
        self._evaluation_repo = EvaluationRepository(session)
        self._judge_repo = JudgeRepository(session)
        self._team_repo = TeamRepository(session)

    async def overview(self, hackathon_id: str | uuid.UUID) -> AnalyticsOverview:
        hackathon = await self._hackathon_repo.get_by_id(str(hackathon_id))
        if hackathon is None:
            raise NotFoundError("Hackathon not found")

        teams = await self._team_repo.list_by_hackathon(hackathon_id)
        submissions = await self._submission_repo.list_by_hackathon(hackathon_id)
        registrations = [
            r for r in await self._registration_repo.list_all() if str(r.hackathon_id) == str(hackathon_id)
        ]
        evaluations = [e for e in await self._evaluation_repo.list_all() if str(e.hackathon_id) == str(hackathon_id)]
        judges = await self._judge_repo.list_by_hackathon(hackathon_id)

        return AnalyticsOverview(
            hackathon_id=str(hackathon.id),
            hackathon_title=hackathon.title,
            generated_at=datetime.now(UTC),
            summary=self._summary(registrations, teams, submissions, evaluations, judges),
            registrations_by_day=self._registrations_by_day(registrations),
            submissions_by_status=self._submissions_by_status(submissions),
            score_distribution=self._score_distribution(teams),
            evaluation_status_distribution=self._evaluation_status_distribution(evaluations),
            engagement=await self._engagement(teams),
        )

    @staticmethod
    def _registrations_by_day(registrations: list[Registration]) -> list[RegistrationDayPoint]:
        by_day: dict[date, int] = {}
        for registration in registrations:
            day = registration.registered_at.date()
            by_day[day] = by_day.get(day, 0) + 1
        return [RegistrationDayPoint(date=day, count=count) for day, count in sorted(by_day.items())]

    @staticmethod
    def _summary(registrations, teams, submissions, evaluations, judges) -> AnalyticsSummary:
        active_registrations = [r for r in registrations if r.status != "CANCELLED"]
        submitted_submissions = sum(1 for s in submissions if s.status in SUBMITTED_SUBMISSION_STATUSES)
        submitted_evaluations = [e for e in evaluations if e.status == "SUBMITTED"]
        average_score = (
            round(sum(e.total_score for e in submitted_evaluations) / len(submitted_evaluations), 2)
            if submitted_evaluations
            else 0.0
        )
        return AnalyticsSummary(
            total_registrations=len(active_registrations),
            participants_count=sum(r.team_size for r in active_registrations),
            teams_count=len(teams),
            active_teams_count=sum(1 for t in teams if t.status == "ACTIVE"),
            total_submissions=len(submissions),
            submitted_submissions=submitted_submissions,
            submission_rate=round(submitted_submissions / len(teams) * 100, 1) if teams else 0.0,
            evaluated_teams_count=sum(1 for t in teams if t.score > 0),
            evaluations_submitted=len(submitted_evaluations),
            evaluations_saved=sum(1 for e in evaluations if e.status == "SAVED"),
            average_score=average_score,
            judges_count=len(judges),
            evaluations_completed=sum(j.completed_count for j in judges),
            evaluations_remaining=sum(j.remaining_count for j in judges),
        )

    @staticmethod
    def _submissions_by_status(submissions) -> list[StatusCount]:
        by_status: dict[str, int] = {}
        for submission in submissions:
            by_status[submission.status] = by_status.get(submission.status, 0) + 1
        return [StatusCount(status=status, count=count) for status, count in sorted(by_status.items())]

    @staticmethod
    def _evaluation_status_distribution(evaluations) -> list[StatusCount]:
        by_status: dict[str, int] = {}
        for evaluation in evaluations:
            by_status[evaluation.status] = by_status.get(evaluation.status, 0) + 1
        return [StatusCount(status=status, count=count) for status, count in sorted(by_status.items())]

    @staticmethod
    def _score_distribution(teams) -> list[ScoreBucket]:
        counts = {label: 0 for label, _, _ in SCORE_BUCKETS}
        for team in teams:
            if team.score > 0:
                counts[AnalyticsService._bucket_for(team.score)] += 1
        return [ScoreBucket(range=label, count=counts[label]) for label, _, _ in SCORE_BUCKETS]

    @staticmethod
    def _bucket_for(score: float) -> str:
        for label, lower, upper in SCORE_BUCKETS:
            if lower <= score < upper:
                return label
        return SCORE_BUCKETS[0][0]

    async def _engagement(self, teams) -> EngagementMetrics:
        activity_events = 0
        commit_velocity: dict[str, dict[str, int]] = {}
        total_commits = total_prs = total_issues = total_tasks = 0
        for team in teams:
            project = await self._team_repo.get_project(team.id)
            if project is not None:
                total_commits += project.commits_count
                total_prs += project.prs_count
                total_issues += project.issues_count
                total_tasks += project.tasks_count
            for item in await self._team_repo.get_activity(team.id):
                activity_events += 1
                bucket = commit_velocity.setdefault(item.timestamp.date().isoformat(), {"commits": 0, "prs": 0})
                if item.type in {"commit", "merge"}:
                    bucket["commits"] += 1
                if item.type in {"pr", "merge"}:
                    bucket["prs"] += 1
        points = [CommitVelocityPoint(time=time, **values) for time, values in sorted(commit_velocity.items())]
        return EngagementMetrics(
            activity_events=activity_events,
            total_commits=total_commits,
            total_prs=total_prs,
            total_issues=total_issues,
            total_tasks=total_tasks,
            commit_velocity=points,
        )
