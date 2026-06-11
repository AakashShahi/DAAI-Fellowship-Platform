from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.constants.curriculum import (
    MODULE_STATUS_ARCHIVED,
    MODULE_STATUS_DRAFT,
    MODULE_STATUS_PUBLISHED,
    RESOURCE_TYPE_ARTICLE,
    RESOURCE_TYPE_ASSIGNMENT,
    RESOURCE_TYPE_DOCUMENT,
    RESOURCE_TYPE_EXTERNAL,
    RESOURCE_TYPE_VIDEO,
)
from app.models.lesson_progress_model import LessonProgressStatus
from app.schema.fellow_schema import SelectedTrack
from app.schema.fellowship_schema import CamelModel

ModuleStatus = Literal["draft", "published", "archived"]
ResourceType = Literal["article", "video", "document", "external", "assignment"]
ProgressStatus = Literal["not-started", "in-progress", "completed"]


class ResourceLink(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    url: str = Field(min_length=1, max_length=2000)
    type: ResourceType = RESOURCE_TYPE_EXTERNAL


class LessonCreatePayload(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    content: str = Field(default="", max_length=100_000)
    video_url: str = Field(default="", max_length=2000)
    resource_links: list[ResourceLink] = Field(default_factory=list)
    order: int = Field(default=0, ge=0)
    estimated_duration_minutes: int = Field(default=0, ge=0, alias="estimatedDurationMinutes")
    estimated_minutes: int = Field(default=0, ge=0)  # legacy alias from AdminLessonsPage
    is_published: bool = False
    # Allow frontend to pass status string (DRAFT / PUBLISHED / ARCHIVED)
    status: str | None = Field(default=None)

    model_config = {"populate_by_name": True}

    @field_validator("title", "description", "content", "video_url", mode="before")
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @property
    def resolved_duration(self) -> int:
        return self.estimated_duration_minutes or self.estimated_minutes or 0

    @property
    def resolved_is_published(self) -> bool:
        if self.status is not None:
            return self.status.upper() == "PUBLISHED"
        return self.is_published


class LessonUpdatePayload(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    content: str | None = Field(default=None, max_length=100_000)
    video_url: str | None = Field(default=None, max_length=2000)
    resource_links: list[ResourceLink] | None = None
    order: int | None = Field(default=None, ge=0)
    estimated_duration_minutes: int | None = Field(default=None, ge=0)
    is_published: bool | None = None

    @field_validator("title", "description", "content", "video_url", mode="before")
    @classmethod
    def strip_optional_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class CurriculumModuleCreate(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    track: SelectedTrack
    order: int = Field(ge=0)
    description: str = Field(default="", max_length=5000)
    status: ModuleStatus = MODULE_STATUS_DRAFT
    lessons: list[LessonCreatePayload] = Field(default_factory=list)

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class CurriculumModuleUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    track: SelectedTrack | None = None
    order: int | None = Field(default=None, ge=0)
    description: str | None = Field(default=None, max_length=5000)
    status: ModuleStatus | None = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_optional_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class LessonResponse(CamelModel):
    id: str
    title: str
    description: str
    content: str
    video_url: str
    resource_links: list[ResourceLink]
    order: int
    estimated_duration_minutes: int
    # Frontend reads both names — provide both for compatibility
    estimated_minutes: int = 0
    is_published: bool
    status: str = "DRAFT"
    created_at: datetime
    updated_at: datetime


class CurriculumModuleResponse(CamelModel):
    id: str
    title: str
    track: SelectedTrack
    description: str
    order: int
    status: ModuleStatus
    lessons: list[LessonResponse]
    lessons_count: int
    created_at: datetime
    updated_at: datetime


class CurriculumModuleSummary(CamelModel):
    id: str
    title: str
    track: SelectedTrack
    description: str
    order: int
    status: ModuleStatus
    lessons_count: int
    created_at: datetime
    updated_at: datetime


class FellowLessonSummary(CamelModel):
    id: str
    title: str
    description: str
    order: int
    estimated_duration_minutes: int
    progress_status: ProgressStatus = LessonProgressStatus.NOT_STARTED.value
    completed: bool = False


class FellowModuleSummary(CamelModel):
    id: str
    title: str
    track: SelectedTrack
    description: str
    order: int
    lesson_count: int
    completed_lesson_count: int
    completion_percentage: int


class FellowModuleDetail(CamelModel):
    module: FellowModuleSummary
    lessons: list[FellowLessonSummary]


class FellowLessonDetail(LessonResponse):
    module_id: str
    track: SelectedTrack
    progress_status: ProgressStatus = LessonProgressStatus.NOT_STARTED.value
    completed: bool = False


class ProgressUpdateRequest(BaseModel):
    status: ProgressStatus


class ProgressUpdateResponse(CamelModel):
    module_id: str
    lesson_id: str
    status: ProgressStatus
    completed_at: datetime | None = None


class ModuleProgressSummary(CamelModel):
    module_id: str
    title: str
    total_lessons: int
    completed_lessons: int
    completion_percentage: int


class FellowProgressSummary(CamelModel):
    total_modules: int
    total_lessons: int
    completed_lessons: int
    completion_percentage: int
    module_progress: list[ModuleProgressSummary]


class CurriculumStatsResponse(BaseModel):
    totalModules: int
    publishedModules: int
    draftModules: int
    archivedModules: int
    totalLessons: int
