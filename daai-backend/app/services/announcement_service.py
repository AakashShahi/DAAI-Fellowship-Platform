from fastapi import HTTPException, status
from app.models.announcement_model import Announcement
from app.schema.announcement_schema import AnnouncementCreate, AnnouncementResponse

class AnnouncementService:
    async def create_announcement(self, data: AnnouncementCreate) -> AnnouncementResponse:
        announcement = Announcement(**data.model_dump())
        await announcement.insert()
        return self._to_response(announcement)

    async def list_announcements(self) -> list[AnnouncementResponse]:
        announcements = await Announcement.find_all().sort(-Announcement.created_at).to_list()
        return [self._to_response(a) for a in announcements]

    async def delete_announcement(self, announcement_id: str) -> None:
        announcement = await Announcement.get(announcement_id)
        if not announcement:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
        await announcement.delete()

    def _to_response(self, announcement: Announcement) -> AnnouncementResponse:
        return AnnouncementResponse(
            id=str(announcement.id),
            title=announcement.title,
            content=announcement.content,
            audience=announcement.audience,
            is_published=announcement.is_published,
            created_at=announcement.created_at,
            updated_at=announcement.updated_at
        )
