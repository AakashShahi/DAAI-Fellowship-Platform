from fastapi import APIRouter, Depends

from app.dependencies.auth_dependency import require_fellow
from app.models.user_model import User
from app.schema.learning_progress_schema import (
    LearningProgressResponse,
    LearningProgressUpdateRequest,
)
from app.services.learning_progress_service import LearningProgressService

router = APIRouter()


@router.get("/me", response_model=LearningProgressResponse)
async def get_my_learning_progress(user: User = Depends(require_fellow)):
    return await LearningProgressService().get_my_progress(user)


@router.get("/me/{learning_track}", response_model=LearningProgressResponse)
async def get_my_learning_progress_by_track(
    learning_track: str,
    user: User = Depends(require_fellow),
):
    return await LearningProgressService().get_my_progress_by_track(
        user,
        learning_track,
    )


@router.put("/me", response_model=LearningProgressResponse)
async def update_my_learning_progress(
    data: LearningProgressUpdateRequest,
    user: User = Depends(require_fellow),
):
    return await LearningProgressService().update_my_progress(user, data)
