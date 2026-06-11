from fastapi import APIRouter, Depends, status
from app.dependencies.auth_dependency import current_staff_user
from app.schema.announcement_schema import AnnouncementCreate, AnnouncementResponse
from app.services.announcement_service import AnnouncementService

router = APIRouter()
service = AnnouncementService()

@router.get("/announcements", response_model=list[AnnouncementResponse])
async def list_announcements(_user=Depends(current_staff_user)):
    return await service.list_announcements()

@router.post("/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(data: AnnouncementCreate, _user=Depends(current_staff_user)):
    return await service.create_announcement(data)

@router.delete("/announcements/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(announcement_id: str, _user=Depends(current_staff_user)):
    await service.delete_announcement(announcement_id)
