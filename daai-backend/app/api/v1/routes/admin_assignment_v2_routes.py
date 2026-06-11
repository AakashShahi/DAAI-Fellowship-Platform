from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth_dependency import current_user, current_staff_user
from app.models.user_model import User, UserRole
from app.schema.assignment_v2_schema import (
    AssignmentCreateV2,
    AssignmentResponseV2,
    AssignmentStatsResponse,
    AssignmentUpdateV2,
    SubmissionResponseV2,
    SubmissionReviewPayload,
)
from app.services.assignment_v2_service import AssignmentV2AdminService

router = APIRouter()


async def current_admin_only(user: User = Depends(current_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return user


@router.get("/assignments", response_model=list[AssignmentResponseV2])
async def list_assignments(
    track: str | None = Query(default=None),
    status: str | None = Query(default=None),
    module_id: str | None = Query(default=None, alias="moduleId"),
    _admin: User = Depends(current_admin_only),
):
    return await AssignmentV2AdminService().list_assignments(track, status, module_id)


@router.post("/assignments", response_model=AssignmentResponseV2, status_code=201)
async def create_assignment(payload: AssignmentCreateV2, admin: User = Depends(current_admin_only)):
    return await AssignmentV2AdminService().create_assignment(payload, admin)


@router.get("/assignments/{assignment_id}", response_model=AssignmentResponseV2)
async def get_assignment(assignment_id: str, _admin: User = Depends(current_admin_only)):
    return await AssignmentV2AdminService().get_assignment(assignment_id)


@router.patch("/assignments/{assignment_id}", response_model=AssignmentResponseV2)
async def update_assignment(
    assignment_id: str,
    payload: AssignmentUpdateV2,
    _admin: User = Depends(current_admin_only),
):
    return await AssignmentV2AdminService().update_assignment(assignment_id, payload)


@router.delete("/assignments/{assignment_id}", response_model=AssignmentResponseV2)
async def archive_assignment(assignment_id: str, _admin: User = Depends(current_admin_only)):
    return await AssignmentV2AdminService().archive_assignment(assignment_id)


@router.get("/assignments/{assignment_id}/submissions", response_model=list[SubmissionResponseV2])
async def list_assignment_submissions(assignment_id: str, _admin: User = Depends(current_admin_only)):
    return await AssignmentV2AdminService().list_submissions(assignment_id)


@router.patch("/submissions/{submission_id}/review", response_model=SubmissionResponseV2)
async def review_submission(
    submission_id: str,
    payload: SubmissionReviewPayload,
    admin: User = Depends(current_admin_only),
):
    return await AssignmentV2AdminService().review_submission(submission_id, payload, admin)


@router.get("/assignment-stats", response_model=AssignmentStatsResponse)
async def get_assignment_stats(_admin: User = Depends(current_staff_user)):
    return await AssignmentV2AdminService().stats()
