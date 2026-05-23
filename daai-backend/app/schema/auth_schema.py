from app.schema.user_schema import BCRYPT_MAX_PASSWORD_BYTES, UserResponse

from pydantic import BaseModel, EmailStr, Field, field_validator


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str | None = None


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str = Field(min_length=1, max_length=256)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_bcrypt_password_length(cls, password: str) -> str:
        if len(password.encode("utf-8")) > BCRYPT_MAX_PASSWORD_BYTES:
            raise ValueError("Password cannot be longer than 72 bytes")

        return password


class MessageResponse(BaseModel):
    message: str
