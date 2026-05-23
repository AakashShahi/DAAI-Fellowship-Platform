from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from pydantic import ValidationError
from starlette.datastructures import UploadFile as StarletteUploadFile

from app.dependencies.auth_dependency import current_admin
from app.models.user_model import User
from app.schema.application_schema import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)
from app.services.application_service import ApplicationService

router = APIRouter()


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_application(request: Request):
    document: UploadFile | None = None

    try:
        if request.headers.get("content-type", "").startswith("multipart/form-data"):
            form_data = await request.form()
            payload = ApplicationCreate.model_validate(
                {
                    "fullName": form_data.get("fullName"),
                    "email": form_data.get("email"),
                    "phone": form_data.get("phone") or None,
                    "organization": form_data.get("organization") or None,
                    "pathway": form_data.get("pathway"),
                    "motivation": form_data.get("motivation"),
                }
            )
            possible_document = form_data.get("document")
            if isinstance(possible_document, StarletteUploadFile):
                document = possible_document
        else:
            payload = ApplicationCreate.model_validate(await request.json())
    except (ValidationError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Application requires name, email, pathway, and motivation.",
        ) from exc

    application = await ApplicationService().create(payload, document)
    return ApplicationService.to_response(application)


@router.get(
    "/admin",
    response_model=list[ApplicationResponse],
)
async def list_applications(_: User = Depends(current_admin)):
    applications = await ApplicationService().list_all()
    return [ApplicationService.to_response(application) for application in applications]


@router.get(
    "/admin/{application_id}",
    response_model=ApplicationResponse,
)
async def get_application(application_id: str, _: User = Depends(current_admin)):
    application = await ApplicationService().get(application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return ApplicationService.to_response(application)


@router.patch(
    "/admin/{application_id}/status",
    response_model=ApplicationResponse,
)
async def update_application_status(
    application_id: str,
    payload: ApplicationStatusUpdate,
    _: User = Depends(current_admin),
):
    application = await ApplicationService().update_status(application_id, payload)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return ApplicationService.to_response(application)
