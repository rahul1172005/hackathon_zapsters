import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_secret_key_too_short_is_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(SECRET_KEY="too-short")


def test_access_ttl_capped_at_900() -> None:
    with pytest.raises(ValidationError):
        Settings(SECRET_KEY="x" * 64, JWT_ACCESS_TOKEN_EXPIRE_SECONDS=901)


def test_defaults() -> None:
    settings = Settings(SECRET_KEY="x" * 64)
    assert settings.JWT_ACCESS_TOKEN_EXPIRE_SECONDS == 900
    assert settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS == 7
    assert settings.is_production is False


def test_production_flag() -> None:
    assert Settings(ENV="production", SECRET_KEY="x" * 64).is_production
