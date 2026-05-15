from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from pymongo import ASCENDING, IndexModel

from app.models.user_model import LearningTrack


class LearningTrackSlug(str, Enum):
    QA = "qa"
    SALESFORCE = "salesforce"
    AWS_PRACTITIONER = "aws-practitioner"
    AWS_ARCHITECT = "aws-architect"


class LearningProgressStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class LearningProgressMilestoneStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class LearningProgressModule(BaseModel):
    module_id: str = Field(min_length=1)
    title: str = Field(min_length=1, max_length=200)
    status: LearningProgressStatus = LearningProgressStatus.NOT_STARTED
    completion_percentage: int = Field(default=0, ge=0, le=100)


class LearningProgressMilestone(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    status: LearningProgressMilestoneStatus = LearningProgressMilestoneStatus.PENDING


USER_LEARNING_TRACK_TO_SLUG: dict[LearningTrack, LearningTrackSlug] = {
    LearningTrack.QA: LearningTrackSlug.QA,
    LearningTrack.SALESFORCE: LearningTrackSlug.SALESFORCE,
    LearningTrack.AWS_PRACTITIONER: LearningTrackSlug.AWS_PRACTITIONER,
    LearningTrack.AWS_ARCHITECT: LearningTrackSlug.AWS_ARCHITECT,
}


def parse_learning_track_slug(value: str | LearningTrackSlug) -> LearningTrackSlug:
    if isinstance(value, LearningTrackSlug):
        return value

    normalized_value = value.strip().replace("_", "-").lower()
    if normalized_value == "aws-solutions-architect":
        normalized_value = LearningTrackSlug.AWS_ARCHITECT.value

    return LearningTrackSlug(normalized_value)


def user_learning_track_to_slug(
    learning_track: LearningTrack | None,
) -> LearningTrackSlug | None:
    if learning_track is None:
        return None

    return USER_LEARNING_TRACK_TO_SLUG[learning_track]


class LearningProgress(Document):
    fellow_id: PydanticObjectId
    learning_track: LearningTrackSlug
    modules_progress: list[LearningProgressModule] = Field(default_factory=list)
    completion_percentage: int = Field(default=0, ge=0, le=100)
    milestones: list[LearningProgressMilestone] = Field(default_factory=list)
    status: LearningProgressStatus = LearningProgressStatus.NOT_STARTED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "learning_progresses"
        indexes = [
            IndexModel(
                [("fellow_id", ASCENDING), ("learning_track", ASCENDING)],
                unique=True,
            ),
            IndexModel([("learning_track", ASCENDING)]),
        ]
