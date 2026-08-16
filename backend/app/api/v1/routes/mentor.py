import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, ConfigDict, Field

from app.api.deps import CurrentUser, SessionDep, require_roles
from app.models.user import User
from app.services.mentor import MentorService

router = APIRouter(prefix="/mentors", tags=["mentors"])


class MentorOptIn(BaseModel):
    expertise: list[str] = Field(min_length=1)


class QuestionCreate(BaseModel):
    hackathon_id: uuid.UUID
    title: str = Field(min_length=1, max_length=256)
    body: str = Field(min_length=1, max_length=4000)
    parent_id: uuid.UUID | None = None


class AnswerCreate(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


class MentorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    name: str
    title: str | None
    bio: str | None
    avatar: str | None
    github_handle: str | None
    linkedin_url: str | None
    skills: list[str]


class MentorAnswerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question_id: uuid.UUID
    mentor: MentorRead
    body: str
    created_at: datetime


class QuestionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    hackathon_id: uuid.UUID
    asker: MentorRead
    title: str
    body: str
    parent_id: uuid.UUID | None
    created_at: datetime
    answers: list[MentorAnswerRead]


MentorDep = Annotated[User, Depends(require_roles("mentor"))]


@router.get("", response_model=list[MentorRead])
async def list_mentors(
    session: SessionDep,
    current_user: CurrentUser,
    expertise: list[str] | None = None,
) -> list[MentorRead]:
    mentors = await MentorService(session).list_mentors(expertise)
    return [MentorRead.model_validate(mentor) for mentor in mentors]


@router.post("/me/opt-in", response_model=MentorRead)
async def mentor_opt_in(
    payload: MentorOptIn,
    session: SessionDep,
    current_user: CurrentUser,
) -> MentorRead:
    user = await MentorService(session).opt_in(current_user, payload.expertise)
    return MentorRead.model_validate(user)


@router.post("/me/opt-out", response_model=MentorRead)
async def mentor_opt_out(
    session: SessionDep,
    current_user: CurrentUser,
) -> MentorRead:
    user = await MentorService(session).opt_out(current_user)
    return MentorRead.model_validate(user)


@router.get("/questions", response_model=list[QuestionRead])
async def list_questions(
    session: SessionDep,
    current_user: CurrentUser,
    hackathon_id: str | None = None,
) -> list[QuestionRead]:
    service = MentorService(session)
    records = await service.list_questions(hackathon_id)
    questions = await service.to_read_many(records)
    return [QuestionRead.model_validate(question) for question in questions]


@router.post("/questions", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
async def ask_question(
    payload: QuestionCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> QuestionRead:
    service = MentorService(session)
    record = await service.ask(current_user, payload.hackathon_id, payload.title, payload.body, payload.parent_id)
    question = await service.to_read(record)
    return QuestionRead.model_validate(question)


@router.get("/questions/{question_id}", response_model=QuestionRead)
async def get_question(
    question_id: str,
    session: SessionDep,
    current_user: CurrentUser,
) -> QuestionRead:
    service = MentorService(session)
    record = await service.get_question(question_id)
    question = await service.to_read(record)
    return QuestionRead.model_validate(question)


@router.post("/questions/{question_id}/answers", response_model=MentorAnswerRead, status_code=status.HTTP_201_CREATED)
async def answer_question(
    question_id: str,
    payload: AnswerCreate,
    session: SessionDep,
    current_user: MentorDep,
) -> MentorAnswerRead:
    service = MentorService(session)
    record = await service.get_question(question_id)
    await service.answer(current_user, question_id, payload.body)
    question = await service.to_read(record)
    return MentorAnswerRead.model_validate(question.answers[-1])
