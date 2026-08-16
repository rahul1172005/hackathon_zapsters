class AppError(Exception):
    """Base application exception."""

    status_code = 500
    code = "internal_error"


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"


class ConflictError(AppError):
    status_code = 409
    code = "conflict"


class ValidationError(AppError):
    status_code = 422
    code = "validation_error"


class UnauthorizedError(AppError):
    status_code = 401
    code = "unauthorized"


class ForbiddenError(AppError):
    status_code = 403
    code = "forbidden"


class TokenExpiredError(UnauthorizedError):
    code = "token_expired"


class InvalidCredentialsError(UnauthorizedError):
    code = "invalid_credentials"


class UserNotOwnerError(ForbiddenError):
    code = "not_owner"


class RateLimitedError(AppError):
    status_code = 429
    code = "rate_limited"
