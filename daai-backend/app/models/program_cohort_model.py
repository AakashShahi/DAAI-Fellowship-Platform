from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class CohortStatus(str, Enum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ProgramCohort(Document):
    name: str = Field(min_length=1, max_length=200)
    track: str
    description: str = Field(default="", max_length=5000)
    start_date: datetime
    end_date: datetime
    status: CohortStatus = CohortStatus.UPCOMING
    fellows: list[PydanticObjectId] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "program_cohorts"
        indexes = [
            IndexModel([("track", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
            IndexModel([("fellows", ASCENDING)]),
        ]
