from fastapi import HTTPException, status

from app.models.user_model import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schema.profile_schema import (
    ChangePasswordRequest,
    LearningTrackUpdateRequest,
    ProfileResponse,
    ProfileUpdateRequest,
)
from app.utils.password import hash_password, verify_password


class ProfileService:
    def __init__(self, user_repository: UserRepository | None = None):
        self.user_repository = user_repository or UserRepository()

    @staticmethod
    def to_response(user: User) -> ProfileResponse:
        avatar_name = user.full_name or user.email

        return ProfileResponse(
            id=str(user.id),
            fullName=user.full_name,
            email=user.email,
            role=user.role,
            phone=user.phone,
            location=user.location,
            bio=user.bio,
            avatarInitial=avatar_name[:1].upper(),
            avatarUrl=user.avatar_url,
            learningTrack=user.learning_track,
        )

    async def update_profile(
        self,
        user: User,
        profile_data: ProfileUpdateRequest,
    ) -> User:
        return await self.user_repository.update_profile(
            user,
            full_name=profile_data.fullName,
            phone=profile_data.phone,
            location=profile_data.location,
            bio=profile_data.bio,
        )

    async def update_learning_track(
        self,
        user: User,
        track_data: LearningTrackUpdateRequest,
    ) -> User:
        if user.role != UserRole.FELLOW:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only fellows can update learning track",
            )

        return await self.user_repository.update_learning_track(
            user,
            track_data.learningTrack,
        )

    async def change_password(
        self,
        user: User,
        password_data: ChangePasswordRequest,
    ) -> None:
        if not verify_password(password_data.currentPassword, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        if password_data.newPassword == password_data.currentPassword:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from current password",
            )

        await self.user_repository.update_password(
            user,
            hash_password(password_data.newPassword),
        )
