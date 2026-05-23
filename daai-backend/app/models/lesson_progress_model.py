from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class LessonProgressStatus(str, Enum):
    NOT_STARTED = "not-started"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"


class LessonProgress(Document):
    fellow_id: PydanticObjectId
    track_id: PydanticObjectId | None = None
    track: str | None = None
    module_id: PydanticObjectId
    lesson_id: PydanticObjectId
    status: LessonProgressStatus = LessonProgressStatus.IN_PROGRESS
    completed_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "lesson_progresses"
        indexes = [
            IndexModel(
                [("fellow_id", ASCENDING), ("lesson_id", ASCENDING)],
                unique=True,
            ),
            IndexModel([("track_id", ASCENDING)]),
        ]
