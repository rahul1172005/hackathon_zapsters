import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=64, pattern=r"^[a-zA-Z0-9_]+$")
    name: str = Field(min_length=1, max_length=128)
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=128)
    title: str | None = Field(default=None, max_length=128)
    bio: str | None = Field(default=None, max_length=2000)
    avatar: str | None = Field(default=None, max_length=512)
    github_handle: str | None = Field(default=None, max_length=128)
    linkedin_url: str | None = Field(default=None, max_length=512)
    skills: list[str] | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    username: str
    name: str
    title: str | None
    bio: str | None
    avatar: str | None
    github_handle: str | None
    linkedin_url: str | None
    roles: list[str]
    skills: list[str]
    is_verified: bool
    created_at: datetime


class MatchingPreferences(BaseModel):
    """Profile used for the team-matchmaking pool (POST /matching/preferences)."""

    skills: list[str] = Field(default_factory=list, max_length=50)
    interests: list[str] = Field(default_factory=list, max_length=50)
    goals: list[str] = Field(default_factory=list, max_length=20)
    desired_roles: list[str] = Field(default_factory=list, max_length=20)
    seeking_team: bool = True
    availability: str = Field(default="part-time", pattern=r"^(full-time|part-time|weekends-only)$")
    title: str | None = Field(default=None, max_length=128)


class MatchingPreferencesRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skills: list[str]
    interests: list[str]
    goals: list[str]
    desired_roles: list[str]
    seeking_team: bool
    availability: str
    title: str | None


class MatchCandidateRead(BaseModel):
    """A scored candidate surfaced by GET /matching/recommendations."""

    user: UserRead
    score: int = Field(ge=0, le=100)
    matched_skills: list[str]
    matched_interests: list[str]


class DirectoryEntryRead(BaseModel):
    """A participant surfaced by GET /matching/directory."""

    user: UserRead
    matched_skills: list[str]
    score: int | None = None
