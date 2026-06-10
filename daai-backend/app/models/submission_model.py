from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from pymongo import ASCENDING, IndexModel


class SubmissionStatus(str, Enum):
    NOT_SUBMITTED = "not-submitted"
    UNDER_REVIEW = "under-review"
    SUBMITTED = "SUBMITTED"
    SUBMITTED_V2 = "submitted"
    REVIEWED = "REVIEWED"
    REVIEWED_V2 = "reviewed"
    NEEDS_REVISION = "NEEDS_REVISION"
    NEEDS_RESUBMISSION = "needs-resubmission"


class SubmissionLink(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    url: str = Field(min_length=1, max_length=2000)
    type: str = Field(default="external", max_length=80)


class Submission(Document):
    assignment_id: PydanticObjectId
    fellow_id: PydanticObjectId
    track_id: PydanticObjectId | None = None
    track: str | None = None
    module_id: PydanticObjectId | None = None
    submission_text: str = Field(default="", max_length=50_000)
    submission_link: str = Field(default="", max_length=2000)
    submission_links: list[SubmissionLink] = Field(default_factory=list)
    file_url: str = Field(default="", max_length=2000)
    status: SubmissionStatus = SubmissionStatus.SUBMITTED
    score: int | None = None
    marks_obtained: int | None = None
    feedback: str = Field(default="", max_length=10_000)
    reviewed_by: PydanticObjectId | None = None
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "submissions"
        indexes = [
            IndexModel(
                [("assignment_id", ASCENDING), ("fellow_id", ASCENDING)],
                unique=True,
            ),
            IndexModel([("track_id", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("fellow_id", ASCENDING)]),
        ]
