from fastapi import APIRouter, Depends

from app.dependencies.auth_dependency import current_admin, current_track_catalog_reader
from app.models.user_model import User
from app.schema.fellowship_schema import TrackCreate, TrackResponse, TrackUpdate
from app.services.fellowship_service import TrackService

router = APIRouter()


@router.get("", response_model=list[TrackResponse])
async def list_tracks(_staff: User = Depends(current_track_catalog_reader)):
    return await TrackService().list_tracks()


@router.post("", response_model=TrackResponse, status_code=201)
async def create_track(
    data: TrackCreate,
    _admin=Depends(current_admin),
):
    return await TrackService().create_track(data)


@router.get("/{track_id}", response_model=TrackResponse)
async def get_track(
    track_id: str,
    _admin=Depends(current_admin),
):
    return await TrackService().get_track(track_id)


@router.patch("/{track_id}", response_model=TrackResponse)
async def update_track(
    track_id: str,
    data: TrackUpdate,
    _admin=Depends(current_admin),
):
    return await TrackService().update_track(track_id, data)


@router.delete("/{track_id}", status_code=204)
async def delete_track(
    track_id: str,
    _admin=Depends(current_admin),
):
    await TrackService().delete_track(track_id)
