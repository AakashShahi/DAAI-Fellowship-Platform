from datetime import datetime
from typing import Literal
from urllib.parse import urlparse

from pydantic import BaseModel, Field, field_validator

from app.schema.fellow_schema import SelectedTrack
from app.schema.fellowship_schema import CamelModel

AssignmentStatusValue = Literal["draft", "published", "archived"]
SubmissionTypeValue = Literal["text", "link", "file-link", "github-link", "mixed"]
SubmissionStatusValue = Literal[
    "not-submitted",
    "submitted",
    "under-review",
    "reviewed",
    "needs-resubmission",
]


class SubmissionLinkPayload(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    url: str = Field(min_length=1, max_length=2000)
    type: str = Field(default="external", max_length=80)

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        if value:
            if not value.startswith(("http://", "https://")):
                value = "https://" + value
            parsed = urlparse(value)
            if not bool(parsed.netloc):
                raise ValueError("Submission link must be a valid URL")
        return value


class AssignmentCreateV2(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=10_000)
    track: SelectedTrack
    module_id: str
    lesson_id: str | None = None
    due_date: datetime
    total_marks: int = Field(ge=0, le=10_000)
    submission_type: SubmissionTypeValue = "text"
    status: AssignmentStatusValue = "draft"

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_strings(cls, value):
        return value.strip() if isinstance(value, str) else value


class AssignmentUpdateV2(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=10_000)
    track: SelectedTrack | None = None
    module_id: str | None = None
    lesson_id: str | None = None
    due_date: datetime | None = None
    total_marks: int | None = Field(default=None, ge=0, le=10_000)
    submission_type: SubmissionTypeValue | None = None
    status: AssignmentStatusValue | None = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_optional_strings(cls, value):
        return value.strip() if isinstance(value, str) else value


class AssignmentResponseV2(CamelModel):
    id: str
    title: str
    description: str
    track: SelectedTrack
    module_id: str
    module_title: str | None = None
    lesson_id: str | None = None
    lesson_title: str | None = None
    due_date: datetime
    total_marks: int
    submission_type: SubmissionTypeValue
    status: AssignmentStatusValue
    created_by: str
    submissions_count: int = 0
    created_at: datetime
    updated_at: datetime


class SubmissionPayload(CamelModel):
    submission_text: str = Field(default="", max_length=50_000)
    submission_links: list[SubmissionLinkPayload] = Field(default_factory=list)


class SubmissionResponseV2(CamelModel):
    id: str
    assignment_id: str
    assignment_title: str | None = None
    fellow_id: str
    fellow_name: str | None = None
    fellow_email: str | None = None
    selected_track: SelectedTrack | None = None
    submission_text: str
    submission_links: list[SubmissionLinkPayload]
    status: SubmissionStatusValue
    marks_obtained: int | None = None
    feedback: str
    reviewed_by: str | None = None
    reviewed_at: datetime | None = None
    submitted_at: datetime
    created_at: datetime
    updated_at: datetime


class FellowAssignmentDetailV2(CamelModel):
    assignment: AssignmentResponseV2
    submission: SubmissionResponseV2 | None = None


class SubmissionReviewPayload(BaseModel):
    status: Literal["reviewed", "needs-resubmission", "under-review"]
    marksObtained: int | None = Field(default=None, ge=0, le=10_000)
    feedback: str = Field(default="", max_length=10_000)


class FellowAssignmentSummaryV2(AssignmentResponseV2):
    submission_status: SubmissionStatusValue = "not-submitted"
    review_status: SubmissionStatusValue = "not-submitted"
    marks_obtained: int | None = None


class FellowAssignmentStats(BaseModel):
    totalAssignments: int
    submittedAssignments: int
    reviewedAssignments: int
    pendingAssignments: int


class AssignmentStatsResponse(BaseModel):
    totalAssignments: int
    publishedAssignments: int
    pendingReviews: int
    reviewedSubmissions: int
    needsResubmission: int
