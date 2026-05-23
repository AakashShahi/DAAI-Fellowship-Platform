from datetime import datetime, timezone
from enum import Enum

from beanie import Document
from pydantic import EmailStr, Field
from pymongo import DESCENDING, IndexModel


class ApplicationStatus(str, Enum):
    NEW = "NEW"
    REVIEWING = "REVIEWING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class FellowshipApplication(Document):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    organization: str | None = Field(default=None, max_length=120)
    pathway: str = Field(min_length=1, max_length=80)
    motivation: str = Field(min_length=1, max_length=1500)
    document_file_name: str | None = Field(default=None, max_length=255)
    document_content_type: str | None = Field(default=None, max_length=120)
    document_url: str | None = Field(default=None, max_length=500)
    admin_notes: str | None = Field(default=None, max_length=2000)
    status: ApplicationStatus = ApplicationStatus.NEW
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "fellowship_applications"
        indexes = [
            IndexModel([("created_at", DESCENDING)]),
            IndexModel([("email", DESCENDING)]),
        ]
