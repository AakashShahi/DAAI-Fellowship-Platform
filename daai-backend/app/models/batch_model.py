from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class BatchStatus(str, Enum):
    PLANNED = "PLANNED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Batch(Document):
    name: str = Field(min_length=1, max_length=200)
    track_id: PydanticObjectId
    start_date: datetime
    end_date: datetime
    status: BatchStatus = BatchStatus.PLANNED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "batches"
        indexes = [
            IndexModel([("track_id", ASCENDING)]),
        ]
