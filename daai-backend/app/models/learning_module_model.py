from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class LearningModuleStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class LearningModule(Document):
    """A module belongs to one fellowship track (catalog)."""

    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    track_id: PydanticObjectId
    order: int = Field(default=0, ge=0)
    status: LearningModuleStatus = LearningModuleStatus.DRAFT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "learning_modules"
        indexes = [
            IndexModel([("track_id", ASCENDING), ("order", ASCENDING)]),
        ]
