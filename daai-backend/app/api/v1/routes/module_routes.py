from fastapi import APIRouter, Depends, Query

from app.dependencies.auth_dependency import current_admin
from app.schema.learning_schema import (
    LearningModuleCreate,
    LearningModuleResponse,
    LearningModuleUpdate,
)
from app.services.learning_service import ModuleAdminService

router = APIRouter()


@router.get("", response_model=list[LearningModuleResponse])
async def list_modules(
    track_id: str | None = Query(default=None, alias="trackId"),
    _admin=Depends(current_admin),
):
    return await ModuleAdminService().list_modules(track_id)


@router.post("", response_model=LearningModuleResponse, status_code=201)
async def create_module(
    data: LearningModuleCreate,
    _admin=Depends(current_admin),
):
    return await ModuleAdminService().create_module(data)


@router.get("/{module_id}", response_model=LearningModuleResponse)
async def get_module(
    module_id: str,
    _admin=Depends(current_admin),
):
    return await ModuleAdminService().get_module(module_id)


@router.patch("/{module_id}", response_model=LearningModuleResponse)
async def update_module(
    module_id: str,
    data: LearningModuleUpdate,
    _admin=Depends(current_admin),
):
    return await ModuleAdminService().update_module(module_id, data)


@router.delete("/{module_id}", status_code=204)
async def delete_module(
    module_id: str,
    _admin=Depends(current_admin),
):
    await ModuleAdminService().delete_module(module_id)
