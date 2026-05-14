from fastapi import APIRouter, Depends

from app.dependencies.auth_dependency import require_fellow
from app.models.user_model import User
from app.schema.learning_schema import (
    FellowLearningSummaryResponse,
    FellowModuleDetailResponse,
    FellowModulesListResponse,
    LessonCompleteResponse,
    LessonFellowDetail,
)
from app.services.learning_service import FellowLearningService

router = APIRouter()


@router.get("/me/summary", response_model=FellowLearningSummaryResponse)
async def learning_summary(user: User = Depends(require_fellow)):
    return await FellowLearningService().learning_summary(user)


@router.get("/me/modules", response_model=FellowModulesListResponse)
async def fellow_list_modules(user: User = Depends(require_fellow)):
    return await FellowLearningService().list_modules(user)


@router.get("/me/modules/{module_id}", response_model=FellowModuleDetailResponse)
async def fellow_module_detail(
    module_id: str,
    user: User = Depends(require_fellow),
):
    return await FellowLearningService().get_module_detail(user, module_id)


@router.get("/me/lessons/{lesson_id}", response_model=LessonFellowDetail)
async def fellow_lesson_detail(
    lesson_id: str,
    user: User = Depends(require_fellow),
):
    return await FellowLearningService().get_lesson_detail(user, lesson_id)


@router.post(
    "/me/lessons/{lesson_id}/complete",
    response_model=LessonCompleteResponse,
)
async def fellow_complete_lesson(
    lesson_id: str,
    user: User = Depends(require_fellow),
):
    return await FellowLearningService().complete_lesson(user, lesson_id)
