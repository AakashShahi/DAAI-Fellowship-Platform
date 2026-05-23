from datetime import datetime

from pydantic import Field

from app.models.learning_progress_model import (
    LearningProgressMilestoneStatus,
    LearningProgressStatus,
    LearningTrackSlug,
)
from app.schema.fellowship_schema import CamelModel


class LearningProgressModulePayload(CamelModel):
    module_id: str = Field(min_length=1)
    title: str = Field(min_length=1, max_length=200)
    status: LearningProgressStatus = LearningProgressStatus.NOT_STARTED
    completion_percentage: int = Field(default=0, ge=0, le=100)


class LearningProgressMilestonePayload(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    status: LearningProgressMilestoneStatus = LearningProgressMilestoneStatus.PENDING


class LearningProgressUpdateRequest(CamelModel):
    learning_track: LearningTrackSlug
    modules: list[LearningProgressModulePayload] | None = None
    completion_percentage: int | None = Field(default=None, ge=0, le=100)
    milestones: list[LearningProgressMilestonePayload] | None = None
    status: LearningProgressStatus | None = None


class LearningProgressResponse(CamelModel):
    id: str
    learning_track: LearningTrackSlug
    completion_percentage: int
    status: LearningProgressStatus
    modules: list[LearningProgressModulePayload]
    milestones: list[LearningProgressMilestonePayload]
    created_at: datetime
    updated_at: datetime
