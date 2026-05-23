from datetime import datetime

from pydantic import Field

from app.models.assignment_model import AssignmentStatus
from app.models.submission_model import SubmissionStatus
from app.schema.fellowship_schema import CamelModel


class AssignmentCreate(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=10_000)
    instructions: str = Field(default="", max_length=50_000)
    track_id: str = Field(min_length=1)
    module_id: str | None = None
    due_date: datetime | None = None
    max_score: int = Field(default=100, ge=0, le=10_000)
    status: AssignmentStatus = AssignmentStatus.DRAFT


class AssignmentUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=10_000)
    instructions: str | None = Field(default=None, max_length=50_000)
    track_id: str | None = None
    module_id: str | None = None
    due_date: datetime | None = None
    max_score: int | None = Field(default=None, ge=0, le=10_000)
    status: AssignmentStatus | None = None


class AssignmentResponse(CamelModel):
    id: str
    title: str
    description: str
    instructions: str
    track_id: str
    module_id: str | None
    due_date: datetime | None
    max_score: int
    status: AssignmentStatus
    created_by: str
    created_at: datetime
    updated_at: datetime


class SubmissionResponse(CamelModel):
    id: str
    assignment_id: str
    fellow_id: str
    track_id: str
    module_id: str | None
    submission_text: str
    submission_link: str
    file_url: str
    status: SubmissionStatus
    score: int | None
    feedback: str
    reviewed_by: str | None
    submitted_at: datetime
    reviewed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class FellowAssignmentSummary(CamelModel):
    id: str
    title: str
    description: str
    track_id: str
    module_id: str | None
    due_date: datetime | None
    max_score: int
    status: AssignmentStatus
    submission_status: SubmissionStatus | None = None
    score: int | None = None


class FellowAssignmentDetailResponse(CamelModel):
    assignment: AssignmentResponse
    submission: SubmissionResponse | None = None


class SubmissionUpsert(CamelModel):
    submission_text: str = Field(default="", max_length=50_000)
    submission_link: str = Field(default="", max_length=2000)
    file_url: str = Field(default="", max_length=2000)


class FellowAssignmentDashboardSummary(CamelModel):
    enrolled: bool
    open_count: int = 0
    submitted_pending_count: int = 0
    needs_revision_count: int = 0
    reviewed_count: int = 0


class SubmissionReviewUpdate(CamelModel):
    status: SubmissionStatus
    score: int | None = Field(default=None, ge=0, le=10_000)
    feedback: str = Field(default="", max_length=10_000)


class SubmissionListItem(CamelModel):
    id: str
    assignment_id: str
    assignment_title: str
    fellow_id: str
    fellow_name: str
    fellow_email: str
    track_id: str
    module_id: str | None
    status: SubmissionStatus
    score: int | None
    submitted_at: datetime
    reviewed_at: datetime | None


class FellowMySubmissionRow(CamelModel):
    id: str
    assignment_id: str
    assignment_title: str
    status: SubmissionStatus
    score: int | None
    feedback: str
    submitted_at: datetime
    reviewed_at: datetime | None


class SubmissionDetailResponse(CamelModel):
    submission: SubmissionResponse
    assignment: AssignmentResponse
    fellow_name: str
    fellow_email: str
