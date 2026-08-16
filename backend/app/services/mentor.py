import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import ClassVar

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.hackathon import Hackathon
from app.models.user import User
from app.repositories.registration import RegistrationRepository

MENTOR_ROLE = "mentor"


@dataclass
class MentorProfile:
    id: uuid.UUID
    username: str
    name: str
    title: str | None
    bio: str | None
    avatar: str | None
    github_handle: str | None
    linkedin_url: str | None
    skills: list[str]


@dataclass
class AnswerRecord:
    id: uuid.UUID
    question_id: uuid.UUID
    mentor_id: uuid.UUID
    body: str
    created_at: datetime


@dataclass
class QuestionRecord:
    id: uuid.UUID
    hackathon_id: uuid.UUID
    asker_id: uuid.UUID
    title: str
    body: str
    parent_id: uuid.UUID | None
    created_at: datetime
    answers: list[AnswerRecord] = field(default_factory=list)


@dataclass
class MentorAnswer:
    id: uuid.UUID
    question_id: uuid.UUID
    mentor: MentorProfile
    body: str
    created_at: datetime


@dataclass
class MentorQuestion:
    id: uuid.UUID
    hackathon_id: uuid.UUID
    asker: MentorProfile
    title: str
    body: str
    parent_id: uuid.UUID | None
    created_at: datetime
    answers: list[MentorAnswer]


class MentorService:
    _questions: ClassVar[dict[uuid.UUID, QuestionRecord]] = {}

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._registrations = RegistrationRepository(session)

    async def list_mentors(self, expertise: list[str] | None) -> list[User]:
        stmt = select(User).where(User.roles.contains([MENTOR_ROLE]), User.is_active.is_(True))
        if expertise:
            stmt = stmt.where(or_(*[User.skills.contains([skill]) for skill in expertise]))
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def opt_in(self, user: User, expertise: list[str]) -> User:
        if MENTOR_ROLE not in user.roles:
            user.roles = [*user.roles, MENTOR_ROLE]
        user.skills = list(dict.fromkeys(expertise))
        await self._session.commit()
        await self._session.refresh(user)
        return user

    async def opt_out(self, user: User) -> User:
        if MENTOR_ROLE in user.roles:
            user.roles = [role for role in user.roles if role != MENTOR_ROLE]
        await self._session.commit()
        await self._session.refresh(user)
        return user

    async def ask(
        self,
        user: User,
        hackathon_id: str | uuid.UUID,
        title: str,
        body: str,
        parent_id: str | uuid.UUID | None,
    ) -> QuestionRecord:
        hackathon_id = uuid.UUID(str(hackathon_id))
        if await self._session.get(Hackathon, hackathon_id) is None:
            raise NotFoundError()
        if await self._registrations.get_for_user_and_hackathon(user.id, hackathon_id) is None:
            raise ForbiddenError("Register for this hackathon before asking a question")
        parent: QuestionRecord | None = None
        if parent_id is not None:
            parent = self._questions.get(uuid.UUID(str(parent_id)))
            if parent is None or parent.hackathon_id != hackathon_id:
                raise NotFoundError()
        question = QuestionRecord(
            id=uuid.uuid4(),
            hackathon_id=hackathon_id,
            asker_id=user.id,
            title=title,
            body=body,
            parent_id=parent.id if parent else None,
            created_at=datetime.now(UTC),
        )
        self._questions[question.id] = question
        return question

    async def answer(self, mentor: User, question_id: str | uuid.UUID, body: str) -> AnswerRecord:
        question = self._questions.get(uuid.UUID(str(question_id)))
        if question is None:
            raise NotFoundError()
        answer = AnswerRecord(
            id=uuid.uuid4(),
            question_id=question.id,
            mentor_id=mentor.id,
            body=body,
            created_at=datetime.now(UTC),
        )
        question.answers.append(answer)
        return answer

    async def get_question(self, question_id: str | uuid.UUID) -> QuestionRecord:
        question = self._questions.get(uuid.UUID(str(question_id)))
        if question is None:
            raise NotFoundError()
        return question

    async def list_questions(self, hackathon_id: str | uuid.UUID | None) -> list[QuestionRecord]:
        if hackathon_id is not None:
            hackathon_id = uuid.UUID(str(hackathon_id))
            return [q for q in self._questions.values() if q.hackathon_id == hackathon_id]
        return list(self._questions.values())

    async def to_read(self, record: QuestionRecord) -> MentorQuestion:
        return (await self._to_read_many([record]))[0]

    async def to_read_many(self, records: list[QuestionRecord]) -> list[MentorQuestion]:
        return await self._to_read_many(records)

    async def _to_read_many(self, records: list[QuestionRecord]) -> list[MentorQuestion]:
        user_ids: set[uuid.UUID] = set()
        for record in records:
            user_ids.add(record.asker_id)
            user_ids.update(answer.mentor_id for answer in record.answers)
        profiles = await self._profiles(list(user_ids))
        questions: list[MentorQuestion] = []
        for record in records:
            asker = profiles.get(record.asker_id)
            if asker is None:
                continue
            answers = [
                MentorAnswer(
                    id=answer.id,
                    question_id=answer.question_id,
                    mentor=profiles[answer.mentor_id],
                    body=answer.body,
                    created_at=answer.created_at,
                )
                for answer in record.answers
                if answer.mentor_id in profiles
            ]
            questions.append(
                MentorQuestion(
                    id=record.id,
                    hackathon_id=record.hackathon_id,
                    asker=asker,
                    title=record.title,
                    body=record.body,
                    parent_id=record.parent_id,
                    created_at=record.created_at,
                    answers=answers,
                )
            )
        return questions

    async def _profiles(self, user_ids: list[uuid.UUID]) -> dict[uuid.UUID, MentorProfile]:
        if not user_ids:
            return {}
        result = await self._session.execute(select(User).where(User.id.in_(user_ids)))
        users = list(result.scalars().all())
        return {
            user.id: MentorProfile(
                id=user.id,
                username=user.username,
                name=user.name,
                title=user.title,
                bio=user.bio,
                avatar=user.avatar,
                github_handle=user.github_handle,
                linkedin_url=user.linkedin_url,
                skills=user.skills,
            )
            for user in users
        }
