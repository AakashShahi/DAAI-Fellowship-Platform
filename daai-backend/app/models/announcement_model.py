from datetime import datetime, timezone
from beanie import Document
from pydantic import Field

class Announcement(Document):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    audience: str = Field(default="ALL") # ALL, FELLOW, INSTRUCTOR, HR
    is_published: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "announcements"
