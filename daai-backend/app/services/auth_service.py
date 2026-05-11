from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.models.user_model import User
from app.repositories.user_repository import UserRepository
from app.schema.user_schema import UserCreate, UserLogin, UserResponse
from app.utils.password import verify_password


class AuthService:
    def __init__(self, user_repository: UserRepository | None = None):
        self.user_repository = user_repository or UserRepository()

    async def register(self, user_data: UserCreate) -> User:
        existing_user = await self.user_repository.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )

        try:
            return await self.user_repository.create(user_data)
        except DuplicateKeyError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            ) from exc

    async def authenticate(self, credentials: UserLogin) -> User:
        user = await self.user_repository.get_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )

        return user

    @staticmethod
    def to_response(user: User) -> UserResponse:
        return UserResponse(
            id=str(user.id),
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
        )
