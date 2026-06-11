from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.activity_log_model import ActivityAction
from app.models.user_model import UserRole


# ── Request schemas ──────────────────────────────────────────────

class StaffCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    role: UserRole


class StaffUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    role: UserRole | None = None


class StaffStatusUpdate(BaseModel):
    is_active: bool


# ── Response schemas ─────────────────────────────────────────────

class StaffListItem(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str | None = None
    role: UserRole
    is_active: bool
    created_at: datetime


class StaffDetail(StaffListItem):
    location: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    updated_at: datetime


class StaffCreateResponse(BaseModel):
    message: str
    staff: StaffListItem
    temporary_password: str


class StaffUpdateResponse(BaseModel):
    message: str
    staff: StaffListItem


class StaffStatusResponse(BaseModel):
    message: str
    staff: StaffListItem


class StaffListResponse(BaseModel):
    items: list[StaffListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# ── Activity log response ───────────────────────────────────────

class ActivityLogItem(BaseModel):
    id: str
    actor_id: str
    actor_name: str
    actor_role: str
    action: ActivityAction
    target_id: str | None = None
    target_name: str | None = None
    description: str
    created_at: datetime


class ActivityLogListResponse(BaseModel):
    items: list[ActivityLogItem]
    total: int
