from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.constants.learning_tracks import (
    LEARNING_TRACK_TO_SELECTED_TRACK,
    SELECTED_TRACK_TO_LEARNING_TRACK,
)
from app.dependencies.auth_dependency import require_fellow
from app.models.user_model import User
from app.schema.fellow_schema import (
    FellowProfileResponse,
    FellowTrackSelectionRequest,
)
from app.schema.cohort_schema import MyCohortResponse
from app.schema.curriculum_schema import (
    FellowLessonDetail,
    FellowModuleDetail,
    FellowModuleSummary,
    FellowProgressSummary,
    ProgressUpdateRequest,
    ProgressUpdateResponse,
)
from app.schema.assignment_v2_schema import (
    FellowAssignmentDetailV2,
    FellowAssignmentStats,
    FellowAssignmentSummaryV2,
    SubmissionPayload,
    SubmissionResponseV2,
)
from app.schema.session_schema import AttendanceSummary, FellowAttendanceRow, SessionResponse
from app.services.cohort_service import CohortService
from app.services.curriculum_service import CurriculumFellowService
from app.services.assignment_v2_service import AssignmentV2FellowService
from app.services.session_service import SessionFellowService

router = APIRouter()


def to_fellow_profile_response(user: User) -> FellowProfileResponse:
    return FellowProfileResponse(
        id=str(user.id),
        fullName=user.full_name,
        email=user.email,
        role=user.role,
        selectedTrack=LEARNING_TRACK_TO_SELECTED_TRACK.get(user.learning_track),
        learningTrack=user.learning_track,
    )


@router.get("/me", response_model=FellowProfileResponse)
async def get_my_fellow_profile(user: User = Depends(require_fellow)):
    return to_fellow_profile_response(user)


@router.post("/select-track", response_model=FellowProfileResponse)
async def select_my_fellow_track(
    payload: FellowTrackSelectionRequest,
    user: User = Depends(require_fellow),
):
    if user.learning_track is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Track already selected. Contact admin to change your track.",
        )

    user.learning_track = SELECTED_TRACK_TO_LEARNING_TRACK[payload.selectedTrack]
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    return to_fellow_profile_response(user)


@router.get("/my-cohort", response_model=MyCohortResponse)
async def get_my_cohort(user: User = Depends(require_fellow)):
    return await CohortService().get_my_cohort(user)


@router.get("/modules", response_model=list[FellowModuleSummary])
async def get_my_modules(user: User = Depends(require_fellow)):
    return await CurriculumFellowService().list_modules(user)


@router.get("/modules/{module_id}", response_model=FellowModuleDetail)
async def get_my_module(
    module_id: str,
    user: User = Depends(require_fellow),
):
    return await CurriculumFellowService().get_module(user, module_id)


@router.get(
    "/modules/{module_id}/lessons/{lesson_id}",
    response_model=FellowLessonDetail,
)
async def get_my_lesson(
    module_id: str,
    lesson_id: str,
    user: User = Depends(require_fellow),
):
    return await CurriculumFellowService().get_lesson(user, module_id, lesson_id)


@router.post(
    "/modules/{module_id}/lessons/{lesson_id}/progress",
    response_model=ProgressUpdateResponse,
)
async def update_my_lesson_progress(
    module_id: str,
    lesson_id: str,
    payload: ProgressUpdateRequest,
    user: User = Depends(require_fellow),
):
    return await CurriculumFellowService().update_progress(
        user,
        module_id,
        lesson_id,
        payload.status,
    )


@router.get("/progress", response_model=FellowProgressSummary)
async def get_my_progress(user: User = Depends(require_fellow)):
    return await CurriculumFellowService().progress_summary(user)


@router.get("/sessions", response_model=list[SessionResponse])
async def get_my_sessions(user: User = Depends(require_fellow)):
    return await SessionFellowService().list_sessions(user)


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_my_session(session_id: str, user: User = Depends(require_fellow)):
    return await SessionFellowService().get_session(user, session_id)


@router.get("/attendance", response_model=list[FellowAttendanceRow])
async def get_my_attendance(user: User = Depends(require_fellow)):
    return await SessionFellowService().attendance_history(user)


@router.get("/attendance-summary", response_model=AttendanceSummary)
async def get_my_attendance_summary(user: User = Depends(require_fellow)):
    return await SessionFellowService().summary(user)


@router.get("/assignments", response_model=list[FellowAssignmentSummaryV2])
async def get_my_assignments(user: User = Depends(require_fellow)):
    return await AssignmentV2FellowService().list_assignments(user)


@router.get("/assignments/summary", response_model=FellowAssignmentStats)
async def get_my_assignment_summary(user: User = Depends(require_fellow)):
    return await AssignmentV2FellowService().summary(user)


@router.get("/assignments/{assignment_id}", response_model=FellowAssignmentDetailV2)
async def get_my_assignment(assignment_id: str, user: User = Depends(require_fellow)):
    return await AssignmentV2FellowService().get_assignment(user, assignment_id)


@router.post("/assignments/{assignment_id}/submit", response_model=SubmissionResponseV2)
async def submit_my_assignment(
    assignment_id: str,
    payload: SubmissionPayload,
    user: User = Depends(require_fellow),
):
    return await AssignmentV2FellowService().submit_assignment(user, assignment_id, payload)


@router.get("/submissions", response_model=list[SubmissionResponseV2])
async def get_my_submissions(user: User = Depends(require_fellow)):
    return await AssignmentV2FellowService().list_my_submissions(user)


@router.get("/submissions/{submission_id}", response_model=SubmissionResponseV2)
async def get_my_submission(submission_id: str, user: User = Depends(require_fellow)):
    return await AssignmentV2FellowService().get_my_submission(user, submission_id)
