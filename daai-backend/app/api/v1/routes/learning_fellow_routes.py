from fastapi import APIRouter, Depends

from app.dependencies.auth_dependency import require_fellow
from app.models.user_model import User
from app.schema.assignment_schema import (
    FellowAssignmentDashboardSummary,
    FellowAssignmentDetailResponse,
    FellowAssignmentSummary,
    FellowMySubmissionRow,
    SubmissionResponse,
    SubmissionUpsert,
)
from app.schema.learning_schema import (
    FellowLearningSummaryResponse,
    FellowModuleDetailResponse,
    FellowModulesListResponse,
    LessonCompleteResponse,
    LessonFellowDetail,
)
from app.services.assignment_submission_service import FellowAssignmentService
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


@router.get("/me/assignments/summary", response_model=FellowAssignmentDashboardSummary)
async def fellow_assignments_summary(user: User = Depends(require_fellow)):
    return await FellowAssignmentService().dashboard_summary(user)


@router.get("/me/assignments", response_model=list[FellowAssignmentSummary])
async def fellow_list_assignments(user: User = Depends(require_fellow)):
    return await FellowAssignmentService().list_my_assignments(user)


@router.get("/me/assignments/{assignment_id}", response_model=FellowAssignmentDetailResponse)
async def fellow_assignment_detail(
    assignment_id: str,
    user: User = Depends(require_fellow),
):
    return await FellowAssignmentService().get_my_assignment(user, assignment_id)


@router.post("/me/assignments/{assignment_id}/submission", response_model=SubmissionResponse)
async def fellow_submit_assignment(
    assignment_id: str,
    data: SubmissionUpsert,
    user: User = Depends(require_fellow),
):
    return await FellowAssignmentService().upsert_my_submission(user, assignment_id, data)


@router.get("/me/submissions", response_model=list[FellowMySubmissionRow])
async def fellow_list_my_submissions(user: User = Depends(require_fellow)):
    return await FellowAssignmentService().list_my_submissions(user)
