from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class Attendance(Document):
    session_id: PydanticObjectId
    fellow_id: PydanticObjectId
    status: AttendanceStatus
    remarks: str = Field(default="", max_length=2000)
    marked_by: PydanticObjectId
    marked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "attendance"
        indexes = [
            IndexModel([("session_id", ASCENDING), ("fellow_id", ASCENDING)], unique=True),
            IndexModel([("fellow_id", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
        ]
