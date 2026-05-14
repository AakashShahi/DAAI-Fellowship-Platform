from fastapi import APIRouter, Depends, Query

from app.dependencies.auth_dependency import current_admin, require_fellow
from app.models.user_model import User
from app.schema.fellowship_schema import (
    EnrollmentCreate,
    EnrollmentDetail,
    EnrollmentListItem,
    EnrollmentUpdate,
    MyEnrollmentResponse,
)
from app.services.fellowship_service import EnrollmentService

router = APIRouter()


@router.get("/me", response_model=MyEnrollmentResponse)
async def get_my_enrollment(user: User = Depends(require_fellow)):
    return await EnrollmentService().get_my_enrollment(user)


@router.get("", response_model=list[EnrollmentListItem])
async def list_enrollments(
    fellow_id: str | None = Query(default=None, alias="fellowId"),
    track_id: str | None = Query(default=None, alias="trackId"),
    _admin=Depends(current_admin),
):
    return await EnrollmentService().list_enrollments(
        fellow_id=fellow_id,
        track_id=track_id,
    )


@router.post("", response_model=EnrollmentDetail, status_code=201)
async def create_enrollment(
    data: EnrollmentCreate,
    _admin=Depends(current_admin),
):
    return await EnrollmentService().create_enrollment(data)


@router.patch("/{enrollment_id}", response_model=EnrollmentDetail)
async def update_enrollment(
    enrollment_id: str,
    data: EnrollmentUpdate,
    _admin=Depends(current_admin),
):
    return await EnrollmentService().update_enrollment(enrollment_id, data)
