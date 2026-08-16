from pydantic import SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    # App
    ENV: str = "development"
    SECRET_KEY: SecretStr
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Database / cache
    DATABASE_URL: str = "postgresql+asyncpg://zapsters:zapsters@localhost:5432/zapsters"
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_SECONDS: int = 900  # 15 minutes
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cookie name for the refresh token
    REFRESH_COOKIE_NAME: str = "zapsters_refresh"

    # Certificates
    CERTIFICATE_DIR: str = "certificates"

    # Razorpay payments (Phase 3) — empty values mean the payment flow is disabled.
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: SecretStr = SecretStr("")
    RAZORPAY_WEBHOOK_SECRET: SecretStr = SecretStr("")
    RAZORPAY_API_BASE: str = "https://api.razorpay.com/v1"
    RAZORPAY_CURRENCY: str = "INR"

    # Discord bridge (Phase 4)
    DISCORD_BOT_TOKEN: SecretStr | None = None
    DISCORD_ANNOUNCEMENT_WEBHOOK_URL: SecretStr | None = None
    BACKEND_BASE_URL: str = "http://localhost:8000"

    # Email (Phase 3) — absent RESEND_API_KEY falls back to a logging backend.
    EMAIL_FROM: str = "Zapsters <no-reply@zapsters.dev>"
    RESEND_API_KEY: SecretStr | None = None
    FRONTEND_URL: str = "http://localhost:3000"

    # Uploads
    UPLOAD_DIR: str = "storage/uploads"
    MAX_UPLOAD_SIZE_MB: int = 10  # per-file upload cap (MB)
    UPLOAD_PER_USER_QUOTA_MB: int = 100  # per-user storage cap (MB)

    @field_validator("MAX_UPLOAD_SIZE_MB", "UPLOAD_PER_USER_QUOTA_MB")
    @classmethod
    def _validate_upload_limits(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("upload size/quota limits must be positive")
        return v

    @field_validator("JWT_ACCESS_TOKEN_EXPIRE_SECONDS")
    @classmethod
    def _cap_access_ttl(cls, v: int) -> int:
        if v > 900:
            raise ValueError("access token TTL must not exceed 900 seconds")
        return v

    @field_validator("SECRET_KEY")
    @classmethod
    def _validate_secret_key(cls, v: SecretStr) -> SecretStr:
        if len(v.get_secret_value()) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v

    @property
    def is_production(self) -> bool:
        return self.ENV == "production"

    @property
    def razorpay_configured(self) -> bool:
        return bool(self.RAZORPAY_KEY_ID and self.RAZORPAY_KEY_SECRET.get_secret_value())


settings = Settings()  # type: ignore[call-arg]  # SECRET_KEY comes from env/.env
