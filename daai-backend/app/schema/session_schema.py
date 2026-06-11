from datetime import datetime
from typing import Literal
from urllib.parse import urlparse

from pydantic import BaseModel, Field, field_validator

from app.schema.fellow_schema import SelectedTrack
from app.schema.fellowship_schema import CamelModel

SessionStatusValue = Literal["scheduled", "completed", "cancelled", "archived"]
AttendanceStatusValue = Literal["present", "absent", "late", "excused"]
AttendanceStatusWithNotMarked = Literal["not-marked", "present", "absent", "late", "excused"]


def _is_valid_url(value: str) -> bool:
    if not value.startswith(("http://", "https://")):
        value = "https://" + value
    parsed = urlparse(value)
    return bool(parsed.netloc)


class SessionCreate(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    cohort_id: str
    session_date: datetime
    start_time: str = Field(min_length=1, max_length=20)
    end_time: str = Field(min_length=1, max_length=20)
    meeting_link: str = Field(default="", max_length=2000)
    recording_link: str = Field(default="", max_length=2000)
    status: SessionStatusValue = "scheduled"

    @field_validator("title", "description", "start_time", "end_time", "meeting_link", "recording_link", mode="before")
    @classmethod
    def strip_strings(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("meeting_link", "recording_link")
    @classmethod
    def validate_optional_url(cls, value: str) -> str:
        if value:
            if not value.startswith(("http://", "https://")):
                value = "https://" + value
            if not _is_valid_url(value):
                raise ValueError("Link must be a valid URL")
        return value


class SessionUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    cohort_id: str | None = None
    session_date: datetime | None = None
    start_time: str | None = Field(default=None, min_length=1, max_length=20)
    end_time: str | None = Field(default=None, min_length=1, max_length=20)
    meeting_link: str | None = Field(default=None, max_length=2000)
    recording_link: str | None = Field(default=None, max_length=2000)
    status: SessionStatusValue | None = None

    @field_validator("title", "description", "start_time", "end_time", "meeting_link", "recording_link", mode="before")
    @classmethod
    def strip_optional_strings(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("meeting_link", "recording_link")
    @classmethod
    def validate_optional_url(cls, value: str | None) -> str | None:
        if value:
            if not value.startswith(("http://", "https://")):
                value = "https://" + value
            if not _is_valid_url(value):
                raise ValueError("Link must be a valid URL")
        return value


class SessionResponse(CamelModel):
    id: str
    title: str
    description: str
    cohort_id: str
    cohort_name: str | None = None
    track: SelectedTrack
    session_date: datetime
    start_time: str
    end_time: str
    meeting_link: str
    recording_link: str
    status: SessionStatusValue
    created_by: str
    attendance_marked_count: int = 0
    created_at: datetime
    updated_at: datetime


class AttendanceMark(CamelModel):
    fellow_id: str
    status: AttendanceStatusValue
    remarks: str = Field(default="", max_length=2000)


class AttendanceBulkUpdate(CamelModel):
    attendance: list[AttendanceMark] = Field(default_factory=list)


class AttendanceRow(CamelModel):
    fellow_id: str
    fellow_name: str
    email: str
    selected_track: SelectedTrack | None = None
    status: AttendanceStatusWithNotMarked
    remarks: str = ""
    marked_by: str | None = None
    marked_at: datetime | None = None


class FellowAttendanceRow(CamelModel):
    id: str | None = None
    session_id: str
    session_title: str
    session_date: datetime
    status: AttendanceStatusWithNotMarked
    remarks: str = ""
    marked_at: datetime | None = None


class AttendanceSummary(BaseModel):
    totalSessions: int
    present: int
    absent: int
    late: int
    excused: int
    attendancePercentage: int


class SessionStatsResponse(BaseModel):
    totalSessions: int
    scheduled: int
    completed: int
    cancelled: int
    averageAttendancePercentage: int
    sessionsNeedingAttendance: int
