from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth_dependency import current_user
from app.models.user_model import User, UserRole
from app.schema.cohort_schema import (
    CohortCreate,
    CohortDetailResponse,
    CohortFellowsUpdate,
    CohortResponse,
    CohortStatsResponse,
    CohortUpdate,
)
from app.services.cohort_service import CohortService

router = APIRouter()


async def current_admin_only(user: User = Depends(current_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return user


@router.get("/cohorts", response_model=list[CohortResponse])
async def list_admin_cohorts(
    track: str | None = Query(default=None),
    status: str | None = Query(default=None),
    _admin: User = Depends(current_admin_only),
):
    return await CohortService().list_cohorts(track=track, status_filter=status)


@router.post("/cohorts", response_model=CohortDetailResponse)
async def create_admin_cohort(
    payload: CohortCreate,
    _admin: User = Depends(current_admin_only),
):
    return await CohortService().create_cohort(payload)


@router.get("/cohorts/{cohort_id}", response_model=CohortDetailResponse)
async def get_admin_cohort(
    cohort_id: str,
    _admin: User = Depends(current_admin_only),
):
    return await CohortService().get_cohort(cohort_id)


@router.patch("/cohorts/{cohort_id}", response_model=CohortDetailResponse)
async def update_admin_cohort(
    cohort_id: str,
    payload: CohortUpdate,
    _admin: User = Depends(current_admin_only),
):
    return await CohortService().update_cohort(cohort_id, payload)


@router.delete("/cohorts/{cohort_id}", response_model=CohortResponse)
async def archive_admin_cohort(
    cohort_id: str,
    _admin: User = Depends(current_admin_only),
):
    return await CohortService().archive_cohort(cohort_id)


@router.patch("/cohorts/{cohort_id}/fellows", response_model=CohortDetailResponse)
async def update_admin_cohort_fellows(
    cohort_id: str,
    payload: CohortFellowsUpdate,
    _admin: User = Depends(current_admin_only),
):
    return await CohortService().update_cohort_fellows(
        cohort_id,
        payload.fellowIds,
    )


@router.get("/cohort-stats", response_model=CohortStatsResponse)
async def get_admin_cohort_stats(_admin: User = Depends(current_admin_only)):
    return await CohortService().get_cohort_stats()
