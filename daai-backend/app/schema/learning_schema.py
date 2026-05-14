from datetime import datetime

from pydantic import Field

from app.models.learning_module_model import LearningModuleStatus
from app.models.lesson_model import LessonStatus
from app.models.lesson_progress_model import LessonProgressStatus
from app.schema.fellowship_schema import CamelModel


class LearningModuleCreate(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    track_id: str = Field(min_length=1)
    order: int = Field(default=0, ge=0)
    status: LearningModuleStatus = LearningModuleStatus.DRAFT


class LearningModuleUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    order: int | None = Field(default=None, ge=0)
    status: LearningModuleStatus | None = None


class LearningModuleResponse(CamelModel):
    id: str
    title: str
    description: str
    track_id: str
    order: int
    status: LearningModuleStatus
    created_at: datetime
    updated_at: datetime


class LearningModuleFellowSummary(CamelModel):
    id: str
    title: str
    description: str
    order: int
    status: LearningModuleStatus
    lesson_count: int
    completed_lesson_count: int


class LessonCreate(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(default="", max_length=100_000)
    video_url: str = Field(default="", max_length=2000)
    resource_url: str = Field(default="", max_length=2000)
    module_id: str = Field(min_length=1)
    order: int = Field(default=0, ge=0)
    estimated_minutes: int = Field(default=0, ge=0)
    status: LessonStatus = LessonStatus.DRAFT


class LessonUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, max_length=100_000)
    video_url: str | None = Field(default=None, max_length=2000)
    resource_url: str | None = Field(default=None, max_length=2000)
    order: int | None = Field(default=None, ge=0)
    estimated_minutes: int | None = Field(default=None, ge=0)
    status: LessonStatus | None = None
    module_id: str | None = None


class LessonResponse(CamelModel):
    id: str
    title: str
    content: str
    video_url: str
    resource_url: str
    module_id: str
    track_id: str
    order: int
    estimated_minutes: int
    status: LessonStatus
    created_at: datetime
    updated_at: datetime


class LessonFellowSummary(CamelModel):
    id: str
    title: str
    order: int
    estimated_minutes: int
    status: LessonStatus
    completed: bool


class LessonFellowDetail(CamelModel):
    id: str
    title: str
    content: str
    video_url: str
    resource_url: str
    module_id: str
    track_id: str
    order: int
    estimated_minutes: int
    status: LessonStatus
    completed: bool


class FellowModuleDetailResponse(CamelModel):
    module: LearningModuleResponse
    lessons: list[LessonFellowSummary]


class FellowModulesListResponse(CamelModel):
    enrolled: bool
    track_id: str | None = None
    modules: list[LearningModuleFellowSummary]


class FellowLearningSummaryResponse(CamelModel):
    enrolled: bool
    total_lessons: int
    completed_lessons: int
    total_modules: int
    modules_fully_completed: int


class LessonCompleteResponse(CamelModel):
    ok: bool = True
    completed_at: datetime
