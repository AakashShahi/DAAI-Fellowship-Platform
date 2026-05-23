from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth_dependency import current_user
from app.models.user_model import User, UserRole
from app.schema.session_schema import (
    AttendanceBulkUpdate,
    AttendanceRow,
    SessionCreate,
    SessionResponse,
    SessionStatsResponse,
    SessionUpdate,
)
from app.services.session_service import SessionAdminService

router = APIRouter()


async def current_admin_only(user: User = Depends(current_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return user


@router.get("/sessions", response_model=list[SessionResponse])
async def list_sessions(
    track: str | None = Query(default=None),
    cohort_id: str | None = Query(default=None, alias="cohortId"),
    status: str | None = Query(default=None),
    _admin: User = Depends(current_admin_only),
):
    return await SessionAdminService().list_sessions(track, cohort_id, status)


@router.post("/sessions", response_model=SessionResponse, status_code=201)
async def create_session(payload: SessionCreate, admin: User = Depends(current_admin_only)):
    return await SessionAdminService().create_session(payload, admin)


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, _admin: User = Depends(current_admin_only)):
    return await SessionAdminService().get_session(session_id)


@router.patch("/sessions/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    payload: SessionUpdate,
    _admin: User = Depends(current_admin_only),
):
    return await SessionAdminService().update_session(session_id, payload)


@router.delete("/sessions/{session_id}", response_model=SessionResponse)
async def archive_session(session_id: str, _admin: User = Depends(current_admin_only)):
    return await SessionAdminService().archive_session(session_id)


@router.get("/sessions/{session_id}/attendance", response_model=list[AttendanceRow])
async def get_attendance(session_id: str, _admin: User = Depends(current_admin_only)):
    return await SessionAdminService().attendance_list(session_id)


@router.patch("/sessions/{session_id}/attendance", response_model=list[AttendanceRow])
async def mark_attendance(
    session_id: str,
    payload: AttendanceBulkUpdate,
    admin: User = Depends(current_admin_only),
):
    return await SessionAdminService().mark_attendance(session_id, payload, admin)


@router.get("/session-stats", response_model=SessionStatsResponse)
async def session_stats(_admin: User = Depends(current_admin_only)):
    return await SessionAdminService().stats()
