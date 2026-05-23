from typing import Literal

from pydantic import BaseModel

from app.models.user_model import LearningTrack, UserRole

SelectedTrack = Literal["qa", "aws-practitioner", "aws-architect", "salesforce"]


class FellowTrackSelectionRequest(BaseModel):
    selectedTrack: SelectedTrack


class FellowProfileResponse(BaseModel):
    id: str
    fullName: str
    email: str
    role: UserRole
    selectedTrack: SelectedTrack | None = None
    learningTrack: LearningTrack | None = None
