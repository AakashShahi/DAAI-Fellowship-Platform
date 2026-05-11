from datetime import datetime, timezone
from enum import Enum

from beanie import Document
from pydantic import EmailStr, Field
from pymongo import ASCENDING, IndexModel


class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    TRAINER = "TRAINER"
    FELLOW = "FELLOW"
    EMPLOYER = "EMPLOYER"


class User(Document):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    hashed_password: str
    role: UserRole = UserRole.FELLOW
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            IndexModel([("email", ASCENDING)], unique=True),
        ]
