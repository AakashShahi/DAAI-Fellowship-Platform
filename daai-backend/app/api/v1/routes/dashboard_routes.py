from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user_model import User, UserRole
from app.dependencies.auth_dependency import current_user, current_staff_user, current_admin
from app.schema.dashboard_schema import (
    AdminDashboardResponse,
    HrDashboardResponse,
    InstructorDashboardResponse,
    FellowDashboardResponse,
)
from app.services.dashboard_service import DashboardService

router = APIRouter()

@router.get("/admin", response_model=AdminDashboardResponse)
async def get_admin_dashboard(admin: User = Depends(current_admin)):
    return await DashboardService().get_admin_dashboard()

@router.get("/hr", response_model=HrDashboardResponse)
async def get_hr_dashboard(hr: User = Depends(current_staff_user)):
    if hr.role not in {UserRole.HR, UserRole.ADMIN, UserRole.SUPER_ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR access required")
    return await DashboardService().get_hr_dashboard()

@router.get("/instructor", response_model=InstructorDashboardResponse)
async def get_instructor_dashboard(instructor: User = Depends(current_staff_user)):
    if instructor.role not in {UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Instructor access required")
    return await DashboardService().get_instructor_dashboard(instructor)

@router.get("/fellow", response_model=FellowDashboardResponse)
async def get_fellow_dashboard(fellow: User = Depends(current_user)):
    if fellow.role != UserRole.FELLOW:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Fellow access required")
    return await DashboardService().get_fellow_dashboard(fellow)
