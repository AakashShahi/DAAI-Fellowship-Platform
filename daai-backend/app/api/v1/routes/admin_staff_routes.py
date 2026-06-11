from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth_dependency import current_user
from app.models.user_model import User, UserRole
from app.schema.staff_schema import (
    ActivityLogListResponse,
    StaffCreate,
    StaffCreateResponse,
    StaffDetail,
    StaffListResponse,
    StaffStatusResponse,
    StaffStatusUpdate,
    StaffUpdate,
    StaffUpdateResponse,
)
from app.services.staff_service import STAFF_MANAGER_ROLES, StaffService

router = APIRouter()


async def current_staff_manager(user: User = Depends(current_user)) -> User:
    """Only Admin, Super Admin, and Mentor (HR) can access staff management."""
    if user.role not in STAFF_MANAGER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff management access required",
        )
    return user


@router.get("/staff", response_model=StaffListResponse)
async def list_staff(
    role: str | None = Query(default=None, description="Filter by role"),
    status_filter: str | None = Query(
        default=None, alias="status", description="Filter by status (active/inactive)"
    ),
    search: str | None = Query(default=None, description="Search by name, email, or phone"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    _manager: User = Depends(current_staff_manager),
):
    return await StaffService().list_staff(
        role_filter=role,
        status_filter=status_filter,
        search=search,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/staff",
    response_model=StaffCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_staff(
    data: StaffCreate,
    actor: User = Depends(current_staff_manager),
):
    return await StaffService().create_staff(data, actor)


@router.get("/staff/allowed-roles", response_model=list[str])
async def get_allowed_roles(actor: User = Depends(current_staff_manager)):
    """Return the list of roles the current user is allowed to create."""
    return await StaffService().get_allowed_roles_for_actor(actor)


@router.get("/staff/{staff_id}", response_model=StaffDetail)
async def get_staff_detail(
    staff_id: str,
    _manager: User = Depends(current_staff_manager),
):
    return await StaffService().get_staff_detail(staff_id)


@router.put("/staff/{staff_id}", response_model=StaffUpdateResponse)
async def update_staff(
    staff_id: str,
    data: StaffUpdate,
    actor: User = Depends(current_staff_manager),
):
    return await StaffService().update_staff(staff_id, data, actor)


@router.patch("/staff/{staff_id}/status", response_model=StaffStatusResponse)
async def toggle_staff_status(
    staff_id: str,
    data: StaffStatusUpdate,
    actor: User = Depends(current_staff_manager),
):
    return await StaffService().toggle_status(staff_id, data.is_active, actor)


@router.get(
    "/staff/{staff_id}/activity-logs",
    response_model=ActivityLogListResponse,
)
async def get_staff_activity_logs(
    staff_id: str,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    _manager: User = Depends(current_staff_manager),
):
    return await StaffService().get_activity_logs(staff_id, skip=skip, limit=limit)
