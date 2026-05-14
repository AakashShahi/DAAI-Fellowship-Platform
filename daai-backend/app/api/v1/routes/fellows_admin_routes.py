from fastapi import APIRouter, Depends

from app.dependencies.auth_dependency import current_admin
from app.schema.fellowship_schema import FellowListItem
from app.services.fellowship_service import list_fellow_users

router = APIRouter()


@router.get("", response_model=list[FellowListItem])
async def list_fellows(_admin=Depends(current_admin)):
    return await list_fellow_users()
