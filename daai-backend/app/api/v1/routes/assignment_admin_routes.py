from fastapi import APIRouter, Depends, Query

from app.dependencies.auth_dependency import current_admin
from app.models.user_model import User
from app.schema.assignment_schema import (
    AssignmentCreate,
    AssignmentResponse,
    AssignmentUpdate,
)
from app.services.assignment_submission_service import AssignmentAdminService

router = APIRouter()


@router.get("", response_model=list[AssignmentResponse])
async def list_assignments(
    track_id: str | None = Query(default=None, alias="trackId"),
    module_id: str | None = Query(default=None, alias="moduleId"),
    _admin: User = Depends(current_admin),
):
    return await AssignmentAdminService().list_assignments(track_id, module_id)


@router.post("", response_model=AssignmentResponse, status_code=201)
async def create_assignment(
    data: AssignmentCreate,
    admin: User = Depends(current_admin),
):
    return await AssignmentAdminService().create_assignment(data, admin)


@router.get("/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(
    assignment_id: str,
    _admin: User = Depends(current_admin),
):
    return await AssignmentAdminService().get_assignment(assignment_id)


@router.patch("/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment(
    assignment_id: str,
    data: AssignmentUpdate,
    _admin: User = Depends(current_admin),
):
    return await AssignmentAdminService().update_assignment(assignment_id, data)


@router.delete("/{assignment_id}", status_code=204)
async def delete_assignment(
    assignment_id: str,
    _admin: User = Depends(current_admin),
):
    await AssignmentAdminService().delete_assignment(assignment_id)
