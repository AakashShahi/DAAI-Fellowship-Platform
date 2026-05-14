from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import ValidationError

from app.dependencies.auth_dependency import current_user
from app.models.user_model import User
from app.schema.profile_schema import (
    ChangePasswordRequest,
    ProfileResponse,
    ProfileUpdateRequest,
)
from app.services.profile_service import ProfileService

router = APIRouter()


def format_validation_errors(error: ValidationError) -> list[dict]:
    formatted_errors = []

    for item in error.errors():
        formatted_item = {
            "loc": item.get("loc", ()),
            "msg": item.get("msg", "Invalid input"),
            "type": item.get("type", "value_error"),
        }

        if item.get("ctx", {}).get("error"):
            formatted_item["msg"] = str(item["ctx"]["error"])

        formatted_errors.append(formatted_item)

    return formatted_errors


async def parse_request_body(request: Request, schema):
    try:
        payload = await request.json()
        return schema.model_validate(payload)
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=format_validation_errors(error),
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request body must be valid JSON",
        ) from error


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(user: User = Depends(current_user)):
    return ProfileService.to_response(user)


@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    request: Request,
    user: User = Depends(current_user),
):
    profile_data = await parse_request_body(request, ProfileUpdateRequest)
    profile_service = ProfileService()
    updated_user = await profile_service.update_profile(user, profile_data)

    return ProfileService.to_response(updated_user)


@router.put("/change-password")
async def change_my_password(
    request: Request,
    user: User = Depends(current_user),
):
    password_data = await parse_request_body(request, ChangePasswordRequest)
    await ProfileService().change_password(user, password_data)

    return {"message": "Password updated successfully"}
