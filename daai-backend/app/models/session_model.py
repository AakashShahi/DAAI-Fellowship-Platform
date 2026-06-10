from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class SessionStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ARCHIVED = "archived"


class Session(Document):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    cohort_id: PydanticObjectId
    track: str
    session_date: datetime
    start_time: str = Field(min_length=1, max_length=20)
    end_time: str = Field(min_length=1, max_length=20)
    meeting_link: str = Field(default="", max_length=2000)
    recording_link: str = Field(default="", max_length=2000)
    status: SessionStatus = SessionStatus.SCHEDULED
    created_by: PydanticObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "sessions"
        indexes = [
            IndexModel([("cohort_id", ASCENDING)]),
            IndexModel([("track", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("session_date", ASCENDING)]),
        ]
