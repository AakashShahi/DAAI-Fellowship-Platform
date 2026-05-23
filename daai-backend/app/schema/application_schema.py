from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.application_model import ApplicationStatus


class ApplicationCreate(BaseModel):
    fullName: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    organization: str | None = Field(default=None, max_length=120)
    pathway: str = Field(min_length=1, max_length=80)
    motivation: str = Field(min_length=1, max_length=1500)


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(BaseModel):
    id: str
    fullName: str
    email: EmailStr
    phone: str | None = None
    organization: str | None = None
    pathway: str
    motivation: str
    documentFileName: str | None = None
    documentContentType: str | None = None
    documentUrl: str | None = None
    status: ApplicationStatus
    lastEmailStatus: str | None = None
    lastEmailError: str | None = None
    lastEmailSentAt: datetime | None = None
    createdAt: datetime
    updatedAt: datetime


class TestEmailRequest(BaseModel):
    email: EmailStr


class TestEmailResponse(BaseModel):
    sent: bool
    status: str
    error: str | None = None
