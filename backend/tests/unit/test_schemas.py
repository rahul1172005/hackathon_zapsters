import uuid

import pytest
from pydantic import ValidationError

from app.schemas.auth import RegisterRequest
from app.schemas.evaluation import EvaluationCreate, RubricScores


class TestRegisterRequest:
    def test_valid(self) -> None:
        data = RegisterRequest(
            email="dev@example.com",
            username="alice_dev",
            name="Alice Dev",
            password="sup3r-secret",
        )
        assert data.username == "alice_dev"

    @pytest.mark.parametrize("username", ["ab", "has space", "hyphen-name", "áccent"])
    def test_rejects_invalid_username(self, username: str) -> None:
        with pytest.raises(ValidationError):
            RegisterRequest(
                email="dev@example.com",
                username=username,
                name="Alice Dev",
                password="sup3r-secret",
            )

    @pytest.mark.parametrize("password", ["short", "1234567"])
    def test_rejects_short_password(self, password: str) -> None:
        with pytest.raises(ValidationError):
            RegisterRequest(
                email="dev@example.com",
                username="alice_dev",
                name="Alice Dev",
                password=password,
            )


class TestRubricScores:
    def test_maximum_scores_total_100(self) -> None:
        scores = RubricScores(innovation=30, technical=30, impact=20, ux=10, presentation=10)
        assert sum(scores.model_dump().values()) == 100

    @pytest.mark.parametrize(
        "field,value",
        [
            ("innovation", 101),
            ("technical", -1),
            ("impact", 101),
            ("ux", 101),
            ("presentation", -5),
        ],
    )
    def test_rejects_out_of_range(self, field: str, value: int) -> None:
        valid = {"innovation": 10, "technical": 10, "impact": 10, "ux": 5, "presentation": 5}
        valid[field] = value
        with pytest.raises(ValidationError):
            RubricScores(**valid)


class TestEvaluationCreate:
    def test_default_status_is_draft(self) -> None:
        payload = EvaluationCreate(
            judge_id=uuid.uuid4(),
            team_id=uuid.uuid4(),
            hackathon_id=uuid.uuid4(),
            scores=RubricScores(innovation=10, technical=10, impact=10, ux=5, presentation=5),
        )
        assert payload.status == "DRAFT"

    def test_rejects_unknown_status(self) -> None:
        with pytest.raises(ValidationError):
            EvaluationCreate(
                judge_id=uuid.uuid4(),
                team_id=uuid.uuid4(),
                hackathon_id=uuid.uuid4(),
                scores=RubricScores(innovation=10, technical=10, impact=10, ux=5, presentation=5),
                status="RELEASED",
            )
