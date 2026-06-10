from typing import Any
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import ValidationError

from app.dependencies.auth_dependency import current_user
from app.models.user_model import User
from app.schema.auth_schema import TokenResponse
from app.schema.user_schema import UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)
from app.utils.jwt import create_access_token

router = APIRouter()


async def parse_login_credentials(request: Request) -> UserLogin:
    content_type = request.headers.get("content-type", "")

    try:
        is_form_request = content_type.startswith(
            "application/x-www-form-urlencoded"
        ) or content_type.startswith("multipart/form-data")

        if is_form_request:
            form_data = await request.form()
            payload: dict[str, Any] = {
                "email": form_data.get("email") or form_data.get("username"),
                "password": form_data.get("password"),
            }
        else:
            payload = await request.json()

        return UserLogin.model_validate(payload)
    except (ValidationError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Login requires email and password",
        ) from exc


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(user_data: UserCreate):
    try:
        logger.info(f"Registration attempt for: {user_data.email}")
        auth_service = AuthService()
        user = await auth_service.register(user_data)
        logger.info(f"User registered successfully: {user_data.email}")
        return AuthService.to_response(user)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Registration error for {user_data.email}: {type(exc).__name__}: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {type(exc).__name__}: {str(exc)}"
        ) from exc


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin = Depends(parse_login_credentials)):
    auth_service = AuthService()
    user = await auth_service.authenticate(credentials)
    user_response = AuthService.to_response(user)
    access_token = create_access_token(subject=str(user.id))

    return TokenResponse(access_token=access_token, user=user_response)


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(current_user)):
    return AuthService.to_response(user)
