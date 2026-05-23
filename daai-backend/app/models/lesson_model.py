from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from pymongo import ASCENDING, IndexModel


class LessonStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class LessonResourceLink(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    url: str = Field(min_length=1, max_length=2000)
    type: str = "external"


class Lesson(Document):
    """Lesson belongs to a module; track_id denormalized for access checks."""

    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    content: str = Field(default="", max_length=100_000)
    video_url: str = Field(default="", max_length=2000)
    resource_url: str = Field(default="", max_length=2000)
    resource_links: list[LessonResourceLink] = Field(default_factory=list)
    module_id: PydanticObjectId
    track_id: PydanticObjectId | None = None
    track: str | None = None
    order: int = Field(default=0, ge=0)
    estimated_minutes: int = Field(default=0, ge=0)
    estimated_duration_minutes: int | None = None
    status: LessonStatus = LessonStatus.DRAFT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "lessons"
        indexes = [
            IndexModel([("module_id", ASCENDING), ("order", ASCENDING)]),
            IndexModel([("track_id", ASCENDING)]),
            IndexModel([("track", ASCENDING)]),
        ]
