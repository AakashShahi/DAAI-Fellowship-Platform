from datetime import datetime, timezone
from enum import Enum

from beanie import Document
from pydantic import Field
from pymongo import ASCENDING, DESCENDING, IndexModel


class ActivityAction(str, Enum):
    STAFF_CREATED = "STAFF_CREATED"
    STAFF_UPDATED = "STAFF_UPDATED"
    STAFF_ACTIVATED = "STAFF_ACTIVATED"
    STAFF_DEACTIVATED = "STAFF_DEACTIVATED"
    STAFF_ROLE_CHANGED = "STAFF_ROLE_CHANGED"
    STAFF_PASSWORD_RESET = "STAFF_PASSWORD_RESET"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"


class ActivityLog(Document):
    actor_id: str = Field(min_length=1)
    actor_name: str = Field(min_length=1, max_length=120)
    actor_role: str = Field(min_length=1, max_length=30)
    action: ActivityAction
    target_id: str | None = None
    target_name: str | None = None
    description: str = Field(default="", max_length=500)
    metadata: dict | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "activity_logs"
        indexes = [
            IndexModel([("actor_id", ASCENDING)]),
            IndexModel([("target_id", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
            IndexModel([("action", ASCENDING)]),
        ]
