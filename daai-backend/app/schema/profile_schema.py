import re

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user_model import LearningTrack, UserRole
from app.schema.user_schema import BCRYPT_MAX_PASSWORD_BYTES

PHONE_PATTERN = re.compile(r"^[+()\-.\s0-9]{7,30}$")


class ProfileResponse(BaseModel):
    id: str
    fullName: str
    email: EmailStr
    role: UserRole
    phone: str | None = None
    location: str | None = None
    bio: str | None = None
    avatarInitial: str
    avatarUrl: str | None = None
    learningTrack: LearningTrack | None = None


class ProfileUpdateRequest(BaseModel):
    fullName: str = Field(min_length=1, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    location: str | None = Field(default=None, max_length=120)
    bio: str | None = Field(default=None, max_length=500)

    @field_validator("fullName", "phone", "location", "bio", mode="before")
    @classmethod
    def strip_optional_strings(cls, value: str | None) -> str | None:
        if value is None:
            return None

        if isinstance(value, str):
            stripped_value = value.strip()
            return stripped_value or None

        return value

    @field_validator("fullName")
    @classmethod
    def validate_full_name(cls, value: str | None) -> str:
        if not value:
            raise ValueError("Full name is required")

        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value and not PHONE_PATTERN.fullmatch(value):
            raise ValueError("Phone number format is invalid")

        return value


class LearningTrackUpdateRequest(BaseModel):
    learningTrack: LearningTrack


class ChangePasswordRequest(BaseModel):
    currentPassword: str = Field(min_length=1, max_length=128)
    newPassword: str = Field(min_length=8, max_length=128)
    confirmPassword: str = Field(min_length=8, max_length=128)

    @field_validator("currentPassword", "newPassword", "confirmPassword")
    @classmethod
    def validate_bcrypt_password_length(cls, password: str) -> str:
        if len(password.encode("utf-8")) > BCRYPT_MAX_PASSWORD_BYTES:
            raise ValueError("Password cannot be longer than 72 bytes")

        return password

    @field_validator("confirmPassword")
    @classmethod
    def validate_confirm_password(cls, value: str, info) -> str:
        if value != info.data.get("newPassword"):
            raise ValueError("New password and confirm password do not match")

        return value
