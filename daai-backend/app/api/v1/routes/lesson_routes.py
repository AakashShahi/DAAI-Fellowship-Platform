from fastapi import APIRouter, Depends, Query

from app.dependencies.auth_dependency import current_admin
from app.schema.learning_schema import LessonCreate, LessonResponse, LessonUpdate
from app.services.learning_service import LessonAdminService

router = APIRouter()


@router.get("", response_model=list[LessonResponse])
async def list_lessons(
    module_id: str | None = Query(default=None, alias="moduleId"),
    track_id: str | None = Query(default=None, alias="trackId"),
    _admin=Depends(current_admin),
):
    return await LessonAdminService().list_lessons(module_id, track_id)


@router.post("", response_model=LessonResponse, status_code=201)
async def create_lesson(
    data: LessonCreate,
    _admin=Depends(current_admin),
):
    return await LessonAdminService().create_lesson(data)


@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: str,
    _admin=Depends(current_admin),
):
    return await LessonAdminService().get_lesson(lesson_id)


@router.patch("/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: str,
    data: LessonUpdate,
    _admin=Depends(current_admin),
):
    return await LessonAdminService().update_lesson(lesson_id, data)


@router.delete("/{lesson_id}", status_code=204)
async def delete_lesson(
    lesson_id: str,
    _admin=Depends(current_admin),
):
    await LessonAdminService().delete_lesson(lesson_id)
