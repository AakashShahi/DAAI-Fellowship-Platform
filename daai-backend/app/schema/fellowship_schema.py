from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.batch_model import BatchStatus
from app.models.enrollment_model import EnrollmentStatus
from app.models.track_model import TrackStatus


def _to_camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=_to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
    )


class TrackCreate(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=5000)
    duration: str = Field(default="", max_length=120)
    difficulty: str = Field(default="", max_length=80)
    status: TrackStatus = TrackStatus.DRAFT

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str) -> str:
        slug = value.strip().lower()
        allowed = set("abcdefghijklmnopqrstuvwxyz0123456789-")
        if not slug or any(c not in allowed for c in slug):
            raise ValueError("Slug must be lowercase letters, numbers, and hyphens only")
        return slug


class TrackUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    duration: str | None = Field(default=None, max_length=120)
    difficulty: str | None = Field(default=None, max_length=80)
    status: TrackStatus | None = None


class TrackResponse(CamelModel):
    id: str
    title: str
    slug: str
    description: str
    duration: str
    difficulty: str
    status: TrackStatus
    created_at: datetime
    updated_at: datetime


class BatchCreate(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    track_id: str = Field(min_length=1)
    start_date: datetime
    end_date: datetime
    status: BatchStatus = BatchStatus.PLANNED


class BatchUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: BatchStatus | None = None


class BatchResponse(CamelModel):
    id: str
    name: str
    track_id: str
    start_date: datetime
    end_date: datetime
    status: BatchStatus
    created_at: datetime
    updated_at: datetime


class EnrollmentCreate(CamelModel):
    fellow_id: str = Field(min_length=1)
    track_id: str = Field(min_length=1)
    batch_id: str = Field(min_length=1)


class EnrollmentUpdate(CamelModel):
    status: EnrollmentStatus
    completed_at: datetime | None = None


class TrackSummary(CamelModel):
    id: str
    title: str
    slug: str
    description: str
    duration: str
    difficulty: str
    status: TrackStatus


class BatchSummary(CamelModel):
    id: str
    name: str
    start_date: datetime
    end_date: datetime
    status: BatchStatus


class EnrollmentDetail(CamelModel):
    id: str
    fellow_id: str
    track_id: str
    batch_id: str
    status: EnrollmentStatus
    enrolled_at: datetime
    completed_at: datetime | None
    track: TrackSummary
    batch: BatchSummary


class MyEnrollmentResponse(CamelModel):
    enrollment: EnrollmentDetail | None = None


class EnrollmentListItem(CamelModel):
    id: str
    fellow_id: str
    track_id: str
    batch_id: str
    status: EnrollmentStatus
    enrolled_at: datetime
    completed_at: datetime | None
    track: TrackSummary
    batch: BatchSummary


class FellowListItem(CamelModel):
    id: str
    full_name: str
    email: str
