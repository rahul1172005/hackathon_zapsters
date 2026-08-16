from dataclasses import dataclass


@dataclass(frozen=True)
class RateLimit:
    times: int
    seconds: int


AUTH_RATE_LIMIT = RateLimit(times=5, seconds=60)
PUBLIC_RATE_LIMIT = RateLimit(times=60, seconds=60)

MAX_FILE_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
