from pydantic import BaseModel, Field
from datetime import datetime

class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    audience: str = "ALL"
    is_published: bool = False

class AnnouncementResponse(AnnouncementCreate):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
