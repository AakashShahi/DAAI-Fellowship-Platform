from fastapi import APIRouter, Depends, Query

from app.dependencies.auth_dependency import current_admin
from app.schema.fellowship_schema import BatchCreate, BatchResponse, BatchUpdate
from app.services.fellowship_service import BatchService

router = APIRouter()


@router.get("", response_model=list[BatchResponse])
async def list_batches(
    track_id: str | None = Query(default=None, alias="trackId"),
    _admin=Depends(current_admin),
):
    return await BatchService().list_batches(track_id)


@router.post("", response_model=BatchResponse, status_code=201)
async def create_batch(
    data: BatchCreate,
    _admin=Depends(current_admin),
):
    return await BatchService().create_batch(data)


@router.get("/{batch_id}", response_model=BatchResponse)
async def get_batch(
    batch_id: str,
    _admin=Depends(current_admin),
):
    return await BatchService().get_batch(batch_id)


@router.patch("/{batch_id}", response_model=BatchResponse)
async def update_batch(
    batch_id: str,
    data: BatchUpdate,
    _admin=Depends(current_admin),
):
    return await BatchService().update_batch(batch_id, data)


@router.delete("/{batch_id}", status_code=204)
async def delete_batch(
    batch_id: str,
    _admin=Depends(current_admin),
):
    await BatchService().delete_batch(batch_id)
