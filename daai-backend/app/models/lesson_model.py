from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class LessonStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class Lesson(Document):
    """Lesson belongs to a module; track_id denormalized for access checks."""

    title: str = Field(min_length=1, max_length=200)
    content: str = Field(default="", max_length=100_000)
    video_url: str = Field(default="", max_length=2000)
    resource_url: str = Field(default="", max_length=2000)
    module_id: PydanticObjectId
    track_id: PydanticObjectId
    order: int = Field(default=0, ge=0)
    estimated_minutes: int = Field(default=0, ge=0)
    status: LessonStatus = LessonStatus.DRAFT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "lessons"
        indexes = [
            IndexModel([("module_id", ASCENDING), ("order", ASCENDING)]),
            IndexModel([("track_id", ASCENDING)]),
        ]
