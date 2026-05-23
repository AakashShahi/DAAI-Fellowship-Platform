from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.models.application_model import FellowshipApplication
from app.schema.application_schema import (
    AdminApplicationResponse,
    ApplicationAdminNotesUpdate,
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)

APPLICATION_UPLOAD_DIR = Path("uploads/applications")


class ApplicationService:
    async def create(
        self,
        payload: ApplicationCreate,
        document: UploadFile | None = None,
    ) -> FellowshipApplication:
        document_file_name = None
        document_content_type = None
        document_url = None

        if document and document.filename:
            document_file_name = document.filename
            document_content_type = document.content_type
            saved_name = await self._save_document(document)
            document_url = f"/uploads/applications/{saved_name}"

        application = FellowshipApplication(
            full_name=payload.fullName.strip(),
            email=payload.email.lower(),
            phone=payload.phone.strip() if payload.phone else None,
            organization=payload.organization.strip() if payload.organization else None,
            pathway=payload.pathway,
            motivation=payload.motivation.strip(),
            document_file_name=document_file_name,
            document_content_type=document_content_type,
            document_url=document_url,
        )
        await application.insert()
        return application

    async def list_all(self) -> list[FellowshipApplication]:
        return await FellowshipApplication.find_all().sort("-created_at").to_list()

    async def get(self, application_id: str) -> FellowshipApplication | None:
        return await FellowshipApplication.get(application_id)

    async def update_status(
        self,
        application_id: str,
        payload: ApplicationStatusUpdate,
    ) -> FellowshipApplication | None:
        application = await FellowshipApplication.get(application_id)
        if application is None:
            return None

        application.status = payload.status
        application.updated_at = datetime.now(timezone.utc)
        await application.save()
        return application

    async def update_admin_notes(
        self,
        application_id: str,
        payload: ApplicationAdminNotesUpdate,
    ) -> FellowshipApplication | None:
        application = await FellowshipApplication.get(application_id)
        if application is None:
            return None

        notes = payload.adminNotes.strip() if payload.adminNotes else None
        application.admin_notes = notes
        application.updated_at = datetime.now(timezone.utc)
        await application.save()
        return application

    @staticmethod
    def to_response(application: FellowshipApplication) -> ApplicationResponse:
        return ApplicationResponse(
            id=str(application.id),
            fullName=application.full_name,
            email=application.email,
            phone=application.phone,
            organization=application.organization,
            pathway=application.pathway,
            motivation=application.motivation,
            documentFileName=application.document_file_name,
            documentContentType=application.document_content_type,
            documentUrl=application.document_url,
            status=application.status,
            createdAt=application.created_at,
            updatedAt=application.updated_at,
        )

    @staticmethod
    def to_admin_response(application: FellowshipApplication) -> AdminApplicationResponse:
        response = ApplicationService.to_response(application)
        return AdminApplicationResponse(
            **response.model_dump(),
            adminNotes=application.admin_notes,
        )

    @staticmethod
    async def _save_document(document: UploadFile) -> str:
        APPLICATION_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        original_name = Path(document.filename or "document").name
        suffix = Path(original_name).suffix
        saved_name = f"{uuid4().hex}{suffix}"
        destination = APPLICATION_UPLOAD_DIR / saved_name

        with destination.open("wb") as file:
            while chunk := await document.read(1024 * 1024):
                file.write(chunk)

        await document.close()
        return saved_name
