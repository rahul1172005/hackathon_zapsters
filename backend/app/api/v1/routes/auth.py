from fastapi import APIRouter, Depends, HTTPException, Request, Response

from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.core.rate_limit import AppRateLimiter
from app.schemas.auth import AuthResponse, LoginRequest, RefreshRequest, RegisterRequest
from app.schemas.user import UserRead
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/",
    )


@router.post("/register", response_model=AuthResponse, status_code=201, dependencies=[Depends(AppRateLimiter("auth"))])
async def register(payload: RegisterRequest, session: SessionDep, response: Response) -> AuthResponse:
    service = AuthService(session)
    user, access_token, refresh_token = await service.register(
        email=payload.email,
        username=payload.username,
        name=payload.name,
        password=payload.password,
    )
    _set_refresh_cookie(response, refresh_token)
    return AuthResponse(user=UserRead.model_validate(user), access_token=access_token)


@router.post("/login", response_model=AuthResponse, dependencies=[Depends(AppRateLimiter("auth"))])
async def login(payload: LoginRequest, session: SessionDep, response: Response) -> AuthResponse:
    service = AuthService(session)
    user, access_token, refresh_token = await service.login(payload.email, payload.password)
    _set_refresh_cookie(response, refresh_token)
    return AuthResponse(user=UserRead.model_validate(user), access_token=access_token)


@router.post("/refresh", response_model=AuthResponse, dependencies=[Depends(AppRateLimiter("auth"))])
async def refresh(
    payload: RefreshRequest,
    request: Request,
    session: SessionDep,
    response: Response,
) -> AuthResponse:
    # The refresh token lives in an httpOnly cookie; the body field exists for
    # clients that cannot use cookies (mobile, CLI) as an escape hatch.
    cookie_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    token = payload.refresh_token or cookie_token
    if token is None:
        raise HTTPException(status_code=401, detail="missing refresh token")

    service = AuthService(session)
    user, access_token, new_refresh = await service.refresh(token)
    _set_refresh_cookie(response, new_refresh)
    return AuthResponse(user=UserRead.model_validate(user), access_token=access_token)


@router.post("/logout", status_code=204)
async def logout() -> Response:
    response = Response(status_code=204)
    response.delete_cookie(settings.REFRESH_COOKIE_NAME, path="/")
    return response


@router.get("/me", response_model=UserRead)
async def me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)
