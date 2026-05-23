from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.models.program_cohort_model import CohortStatus
from app.schema.fellow_schema import SelectedTrack
from app.schema.fellowship_schema import CamelModel


class CohortFellowSummary(CamelModel):
    id: str
    full_name: str
    email: str
    selected_track: SelectedTrack | None = None
    status: str


class CohortCreate(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    track: SelectedTrack
    description: str = Field(default="", max_length=5000)
    start_date: datetime
    end_date: datetime
    status: CohortStatus = CohortStatus.UPCOMING
    fellows: list[str] = Field(default_factory=list)

    @field_validator("name", "description", mode="before")
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class CohortUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    track: SelectedTrack | None = None
    description: str | None = Field(default=None, max_length=5000)
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: CohortStatus | None = None

    @field_validator("name", "description", mode="before")
    @classmethod
    def strip_optional_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class CohortFellowsUpdate(BaseModel):
    fellowIds: list[str] = Field(default_factory=list)


class CohortResponse(CamelModel):
    id: str
    name: str
    track: SelectedTrack
    description: str
    start_date: datetime
    end_date: datetime
    status: CohortStatus
    fellows: list[str]
    fellows_count: int
    created_at: datetime
    updated_at: datetime


class CohortDetailResponse(CohortResponse):
    fellow_details: list[CohortFellowSummary] = Field(default_factory=list)


class MyCohortResponse(BaseModel):
    cohort: CohortResponse | None = None
    message: str | None = None


class CohortStatsResponse(BaseModel):
    totalCohorts: int
    active: int
    upcoming: int
    completed: int
    archived: int
