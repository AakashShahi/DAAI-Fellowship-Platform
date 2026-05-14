from datetime import datetime, timezone
from enum import Enum

from beanie import Document
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class TrackStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"


class Track(Document):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=5000)
    duration: str = Field(default="", max_length=120)
    difficulty: str = Field(default="", max_length=80)
    status: TrackStatus = TrackStatus.DRAFT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "tracks"
        indexes = [
            IndexModel([("slug", ASCENDING)], unique=True),
        ]
