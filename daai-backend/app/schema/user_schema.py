from pydantic import BaseModel, EmailStr, Field

from app.models.user_model import UserRole


class UserCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.FELLOW


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
