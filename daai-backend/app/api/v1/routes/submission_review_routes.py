from fastapi import APIRouter, Depends, Query

from app.dependencies.auth_dependency import current_submission_reviewer
from app.models.submission_model import SubmissionStatus
from app.models.user_model import User
from app.schema.assignment_schema import (
    SubmissionDetailResponse,
    SubmissionListItem,
    SubmissionResponse,
    SubmissionReviewUpdate,
)
from app.services.assignment_submission_service import SubmissionReviewService

router = APIRouter()


@router.get("", response_model=list[SubmissionListItem])
async def list_submissions(
    assignment_id: str | None = Query(default=None, alias="assignmentId"),
    track_id: str | None = Query(default=None, alias="trackId"),
    status: SubmissionStatus | None = Query(default=None),
    fellow_id: str | None = Query(default=None, alias="fellowId"),
    _reviewer: User = Depends(current_submission_reviewer),
):
    return await SubmissionReviewService().list_submissions(
        assignment_id=assignment_id,
        track_id=track_id,
        status=status,
        fellow_id=fellow_id,
    )


@router.get("/{submission_id}", response_model=SubmissionDetailResponse)
async def get_submission(
    submission_id: str,
    _reviewer: User = Depends(current_submission_reviewer),
):
    return await SubmissionReviewService().get_submission_detail(submission_id)


@router.patch("/{submission_id}/review", response_model=SubmissionResponse)
async def review_submission(
    submission_id: str,
    data: SubmissionReviewUpdate,
    reviewer: User = Depends(current_submission_reviewer),
):
    return await SubmissionReviewService().review_submission(submission_id, data, reviewer)
