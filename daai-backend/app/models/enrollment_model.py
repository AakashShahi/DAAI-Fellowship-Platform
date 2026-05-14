from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class EnrollmentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    WITHDRAWN = "WITHDRAWN"


class Enrollment(Document):
    fellow_id: PydanticObjectId
    track_id: PydanticObjectId
    batch_id: PydanticObjectId
    status: EnrollmentStatus = EnrollmentStatus.ACTIVE
    enrolled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "enrollments"
        indexes = [
            IndexModel(
                [("fellow_id", ASCENDING)],
                unique=True,
                partialFilterExpression={"status": "ACTIVE"},
            ),
            IndexModel([("batch_id", ASCENDING)]),
            IndexModel([("track_id", ASCENDING)]),
        ]
