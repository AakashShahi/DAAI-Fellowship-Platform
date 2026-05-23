from datetime import datetime
from typing import Literal

from pydantic import BaseModel, field_validator

from app.models.user_model import UserRole
from app.schema.fellow_schema import SelectedTrack
from app.schema.fellowship_schema import CamelModel

TrackFilter = Literal["qa", "aws-practitioner", "aws-architect", "salesforce", "unassigned"]


class AdminFellowListItem(CamelModel):
    id: str
    full_name: str
    email: str
    role: UserRole
    selected_track: SelectedTrack | None = None
    created_at: datetime
    status: str


class AdminFellowTrackUpdateRequest(BaseModel):
    selectedTrack: SelectedTrack | None = None

    @field_validator("selectedTrack", mode="before")
    @classmethod
    def empty_string_resets_track(cls, value):
        if isinstance(value, str) and not value.strip():
            return None
        return value


class AdminFellowTrackUpdateResponse(CamelModel):
    message: str
    fellow: AdminFellowListItem


class AdminTrackStatsResponse(BaseModel):
    totalFellows: int
    unassigned: int
    tracks: dict[str, int]
