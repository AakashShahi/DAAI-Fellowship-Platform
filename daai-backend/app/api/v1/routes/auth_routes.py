from fastapi import APIRouter, Depends, status

from app.dependencies.auth_dependency import current_user
from app.models.user_model import User
from app.schema.auth_schema import TokenResponse
from app.schema.user_schema import UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService
from app.utils.jwt import create_access_token

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(user_data: UserCreate):
    auth_service = AuthService()
    user = await auth_service.register(user_data)
    return AuthService.to_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    auth_service = AuthService()
    user = await auth_service.authenticate(credentials)
    user_response = AuthService.to_response(user)
    access_token = create_access_token(subject=str(user.id))

    return TokenResponse(access_token=access_token, user=user_response)


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(current_user)):
    return AuthService.to_response(user)
