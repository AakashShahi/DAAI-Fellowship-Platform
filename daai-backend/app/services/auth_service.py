from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.core.config import settings
from app.models.user_model import User
from app.repositories.user_repository import UserRepository
from app.schema.auth_schema import ForgotPasswordResponse, ResetPasswordRequest
from app.schema.user_schema import UserCreate, UserLogin, UserResponse
from app.utils.password import hash_password, verify_password


PASSWORD_RESET_TOKEN_BYTES = 32
PASSWORD_RESET_EXPIRE_MINUTES = 30
PASSWORD_RESET_MESSAGE = (
    "If an account exists for that email, password reset instructions have been sent."
)


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

    async def request_password_reset(self, email: str) -> ForgotPasswordResponse:
        user = await self.user_repository.get_by_email(email)
        if not user or not user.is_active:
            return ForgotPasswordResponse(message=PASSWORD_RESET_MESSAGE)

        reset_token = secrets.token_urlsafe(PASSWORD_RESET_TOKEN_BYTES)
        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=PASSWORD_RESET_EXPIRE_MINUTES
        )
        await self.user_repository.set_password_reset_token(
            user,
            token_hash=self._hash_reset_token(reset_token),
            expires_at=expires_at,
        )

        if settings.APP_ENV.lower() in {"development", "local", "test"}:
            return ForgotPasswordResponse(
                message=PASSWORD_RESET_MESSAGE,
                reset_token=reset_token,
            )

        return ForgotPasswordResponse(message=PASSWORD_RESET_MESSAGE)

    async def reset_password(self, password_data: ResetPasswordRequest) -> None:
        user = await self.user_repository.get_by_email(password_data.email)
        token_hash = self._hash_reset_token(password_data.token)
        now = datetime.now(timezone.utc)

        if (
            not user
            or not user.password_reset_token_hash
            or not user.password_reset_expires_at
            or not secrets.compare_digest(user.password_reset_token_hash, token_hash)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset token",
            )

        expires_at = user.password_reset_expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < now:
            await self.user_repository.clear_password_reset_token(user)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset token",
            )

        await self.user_repository.update_password(
            user,
            hash_password(password_data.new_password),
        )

    @staticmethod
    def to_response(user: User) -> UserResponse:
        return UserResponse(
            id=str(user.id),
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            learningTrack=user.learning_track,
        )

    @staticmethod
    def _hash_reset_token(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()
