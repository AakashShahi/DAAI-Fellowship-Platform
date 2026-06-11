from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth_dependency import current_user, current_staff_user
from app.models.user_model import User, UserRole
from app.schema.admin_fellow_schema import (
    AdminFellowListItem,
    AdminFellowProfile,
    AdminFellowTrackUpdateRequest,
    AdminFellowTrackUpdateResponse,
    AdminTrackStatsResponse,
)
from app.services.admin_fellow_service import AdminFellowService

router = APIRouter()


async def current_admin_only(user: User = Depends(current_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return user


@router.get("/fellows", response_model=list[AdminFellowListItem])
async def list_admin_fellows(
    track: str | None = Query(default=None),
    _admin: User = Depends(current_admin_only),
):
    return await AdminFellowService().list_fellows(track)


@router.get("/fellows/{fellow_id}", response_model=AdminFellowProfile)
async def get_admin_fellow_profile(
    fellow_id: str,
    _admin: User = Depends(current_admin_only),
):
    return await AdminFellowService().get_fellow_profile(fellow_id)


@router.patch(
    "/fellows/{fellow_id}/track",
    response_model=AdminFellowTrackUpdateResponse,
)
async def update_admin_fellow_track(
    fellow_id: str,
    payload: AdminFellowTrackUpdateRequest,
    _admin: User = Depends(current_admin_only),
):
    return await AdminFellowService().update_fellow_track(
        fellow_id,
        payload.selectedTrack,
    )


@router.get("/track-stats", response_model=AdminTrackStatsResponse)
async def get_admin_track_stats(_admin: User = Depends(current_staff_user)):
    return await AdminFellowService().get_track_stats()
