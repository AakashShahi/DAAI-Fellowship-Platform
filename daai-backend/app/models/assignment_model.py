from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class AssignmentStatus(str, Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class AssignmentSubmissionType(str, Enum):
    TEXT = "text"
    LINK = "link"
    FILE_LINK = "file-link"
    GITHUB_LINK = "github-link"
    MIXED = "mixed"


class Assignment(Document):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=10_000)
    instructions: str = Field(default="", max_length=50_000)
    track_id: PydanticObjectId | None = None
    track: str | None = None
    module_id: PydanticObjectId | None = None
    lesson_id: PydanticObjectId | None = None
    due_date: datetime | None = None
    max_score: int = Field(default=100, ge=0, le=10_000)
    total_marks: int | None = None
    submission_type: AssignmentSubmissionType = AssignmentSubmissionType.TEXT
    status: AssignmentStatus = AssignmentStatus.DRAFT
    created_by: PydanticObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "assignments"
        indexes = [
            IndexModel([("track_id", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("track", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("module_id", ASCENDING)]),
        ]
