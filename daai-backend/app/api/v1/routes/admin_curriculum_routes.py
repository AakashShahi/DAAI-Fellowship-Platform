from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.dependencies.auth_dependency import current_user
from app.models.user_model import User, UserRole
from app.schema.curriculum_schema import (
    CurriculumModuleCreate,
    CurriculumModuleResponse,
    CurriculumModuleSummary,
    CurriculumModuleUpdate,
    CurriculumStatsResponse,
    LessonCreatePayload,
    LessonResponse,
    LessonUpdatePayload,
)
from app.services.curriculum_service import CurriculumAdminService

router = APIRouter()


async def current_admin_only(user: User = Depends(current_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


@router.get("/modules", response_model=list[CurriculumModuleSummary])
async def list_admin_modules(
    track: str | None = Query(default=None),
    status: str | None = Query(default=None),
    _admin: User = Depends(current_admin_only),
):
    return await CurriculumAdminService().list_modules(
        track=track,
        status_filter=status,
    )


@router.post("/modules", response_model=CurriculumModuleResponse, status_code=201)
async def create_admin_module(
    payload: CurriculumModuleCreate,
    _admin: User = Depends(current_admin_only),
):
    return await CurriculumAdminService().create_module(payload)


@router.get("/modules/{module_id}", response_model=CurriculumModuleResponse)
async def get_admin_module(
    module_id: str,
    _admin: User = Depends(current_admin_only),
):
    return await CurriculumAdminService().get_module(module_id)


@router.patch("/modules/{module_id}", response_model=CurriculumModuleResponse)
async def update_admin_module(
    module_id: str,
    payload: CurriculumModuleUpdate,
    _admin: User = Depends(current_admin_only),
):
    return await CurriculumAdminService().update_module(module_id, payload)


@router.delete("/modules/{module_id}", response_model=CurriculumModuleSummary)
async def archive_admin_module(
    module_id: str,
    _admin: User = Depends(current_admin_only),
):
    return await CurriculumAdminService().archive_module(module_id)


@router.post(
    "/modules/{module_id}/lessons",
    response_model=LessonResponse,
    status_code=201,
)
async def add_admin_lesson(
    module_id: str,
    payload: LessonCreatePayload,
    _admin: User = Depends(current_admin_only),
):
    return await CurriculumAdminService().add_lesson(module_id, payload)


@router.patch(
    "/modules/{module_id}/lessons/{lesson_id}",
    response_model=LessonResponse,
)
async def update_admin_lesson(
    module_id: str,
    lesson_id: str,
    payload: LessonUpdatePayload,
    _admin: User = Depends(current_admin_only),
):
    return await CurriculumAdminService().update_lesson(module_id, lesson_id, payload)


@router.delete("/modules/{module_id}/lessons/{lesson_id}", status_code=204)
async def delete_admin_lesson(
    module_id: str,
    lesson_id: str,
    _admin: User = Depends(current_admin_only),
):
    await CurriculumAdminService().delete_lesson(module_id, lesson_id)
    return Response(status_code=204)


@router.get("/curriculum-stats", response_model=CurriculumStatsResponse)
async def get_admin_curriculum_stats(_admin: User = Depends(current_admin_only)):
    return await CurriculumAdminService().get_stats()
