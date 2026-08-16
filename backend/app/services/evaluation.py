from collections import defaultdict

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationError
from app.models.evaluation import Evaluation
from app.repositories.hackathon import HackathonRepository
from app.repositories.judge import EvaluationRepository, JudgeRepository
from app.repositories.submission import SubmissionRepository
from app.repositories.team import TeamRepository
from app.schemas.evaluation import EvaluationCreate, EvaluationRead
from app.schemas.submission import StandingRead

DEFAULT_RUBRIC = {"innovation": 30, "technical": 30, "impact": 20, "ux": 10, "presentation": 10}


class EvaluationService:
    RUBRIC_MAX = DEFAULT_RUBRIC

    def __init__(self, session: AsyncSession) -> None:
        self._repo = EvaluationRepository(session)
        self._judge_repo = JudgeRepository(session)
        self._team_repo = TeamRepository(session)
        self._hackathon_repo = HackathonRepository(session)
        self._submission_repo = SubmissionRepository(session)
        self._session = session

    async def get_for_judge_and_team(self, judge_id, team_id) -> Evaluation | None:
        return await self._repo.get_for_judge_and_team(judge_id, team_id)

    async def get_read_for_judge_and_team(self, judge_id, team_id) -> EvaluationRead:
        evaluation = await self.get_for_judge_and_team(judge_id, team_id)
        if evaluation is None:
            raise NotFoundError()
        return await self.to_read(evaluation)

    async def save(self, data: EvaluationCreate) -> Evaluation:
        scores = data.scores.model_dump()
        rubric = await self._rubric_for(data.hackathon_id)
        self._validate_scores(scores, rubric)
        total = round(sum(scores.values()), 2)
        existing = await self._repo.get_for_judge_and_team(data.judge_id, data.team_id)
        if existing is not None:
            existing.scores = scores
            existing.total_score = total
            existing.notes = data.notes
            existing.status = data.status
        else:
            existing = Evaluation(
                judge_id=data.judge_id,
                team_id=data.team_id,
                hackathon_id=data.hackathon_id,
                scores=scores,
                total_score=total,
                notes=data.notes,
                status=data.status,
            )
            self._session.add(existing)
        await self._session.commit()
        await self._session.refresh(existing)
        if data.status == "SUBMITTED":
            await self._recompute_team_score(data.team_id)
        return existing

    async def to_read(self, evaluation: Evaluation) -> EvaluationRead:
        read = EvaluationRead.model_validate(evaluation)
        judge = await self._judge_repo.get_by_id(str(evaluation.judge_id))
        if judge is not None:
            read.judge_name = judge.name
        team = await self._team_repo.get_by_id(str(evaluation.team_id))
        if team is not None:
            read.team_name = team.name
        return read

    async def standings(self, hackathon_id: str) -> list[StandingRead]:
        """Auto-scored standings for a hackathon.

        Every submitted evaluation contributes per-criterion scores; each
        criterion is averaged across judges and multiplied by its rubric
        weight (the rubric's per-criterion maxima double as weights, so the
        weighted aggregate equals the mean of each evaluation's total). The
        leaderboard-facing ``team.score`` and each submission's
        ``average_score`` / ``evaluation_count`` are refreshed in place.
        """
        rubric = await self._rubric_for(hackathon_id)
        evaluations = await self._repo.list_all()
        submitted = [e for e in evaluations if str(e.hackathon_id) == str(hackathon_id) and e.status == "SUBMITTED"]

        by_team: dict[str, list[Evaluation]] = defaultdict(list)
        for evaluation in submitted:
            by_team[str(evaluation.team_id)].append(evaluation)

        scores_by_team: dict[str, tuple[float, int]] = {}
        for team_id, team_evaluations in by_team.items():
            weighted_total = 0.0
            for category in rubric:
                category_avg = sum(e.scores.get(category, 0) for e in team_evaluations) / len(team_evaluations)
                weighted_total += category_avg
            scores_by_team[team_id] = (round(weighted_total, 2), len(team_evaluations))

        submissions = await self._submission_repo.list_by_hackathon(hackathon_id)
        standings: list[StandingRead] = []
        for submission in submissions:
            team_id = str(submission.team_id)
            score, count = scores_by_team.get(team_id, (0.0, 0))
            team = await self._team_repo.get_by_id(team_id)
            submission.average_score = score
            submission.evaluation_count = count
            if team is not None:
                team.score = score
                team.status = "JUDGING"
            standings.append(
                StandingRead(
                    submission_id=submission.id,
                    team_id=submission.team_id,
                    team_name=team.name if team is not None else None,
                    team_slug=team.slug if team is not None else None,
                    hackathon_id=submission.hackathon_id,
                    track=submission.track,
                    project_name=submission.project_name,
                    tagline=submission.tagline,
                    description=submission.description,
                    repo_url=submission.repo_url,
                    demo_url=submission.demo_url,
                    presentation_url=submission.presentation_url,
                    tech_stack=submission.tech_stack or [],
                    submitted_at=submission.submitted_at,
                    status=submission.status,
                    evaluation_count=count,
                    average_score=score,
                    score=score,
                    rank=0,
                )
            )
        standings.sort(key=lambda row: (-row.score, row.submitted_at))
        for index, row in enumerate(standings, start=1):
            row.rank = index
        await self._session.commit()
        return standings

    @staticmethod
    def _validate_scores(scores: dict, rubric: dict) -> None:
        for category, max_value in rubric.items():
            if scores.get(category, 0) > max_value:
                raise ValidationError(f"Score for '{category}' exceeds the rubric maximum of {max_value}")

    async def _rubric_for(self, hackathon_id) -> dict:
        hackathon = await self._hackathon_repo.get_by_id(str(hackathon_id))
        return hackathon.rubric if hackathon is not None and hackathon.rubric else DEFAULT_RUBRIC

    async def _recompute_team_score(self, team_id) -> None:
        evaluations = await self._repo.list_all()
        matching = [e for e in evaluations if str(e.team_id) == str(team_id) and e.status == "SUBMITTED"]
        if not matching:
            return
        average = round(sum(e.total_score for e in matching) / len(matching), 2)
        team = await self._team_repo.get_by_id(str(team_id))
        if team is None:
            raise NotFoundError()
        team.score = average
        team.status = "JUDGING"
        submission = await self._submission_repo.get_by_team(team_id)
        if submission is not None:
            submission.average_score = average
            submission.evaluation_count = len(matching)
        await self._session.commit()
