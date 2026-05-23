from datetime import datetime, timezone
import logging
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.models.application_model import ApplicationStatus
from app.models.application_model import FellowshipApplication
from app.schema.application_schema import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)
from app.services.email_service import EmailService

APPLICATION_UPLOAD_DIR = Path("uploads/applications")
logger = logging.getLogger(__name__)

STATUS_EMAILS = {
    ApplicationStatus.ACCEPTED: (
        "Your DAAI Fellowship application has been accepted",
        """Hi {full_name},

Congratulations. Your application for {pathway} has been accepted.

Our team will contact you with next steps for onboarding and cohort placement.

Regards,
DAAI Fellowship Team
""",
    ),
    ApplicationStatus.REJECTED: (
        "Update on your DAAI Fellowship application",
        """Hi {full_name},

Thank you for applying to the DAAI Fellowship for {pathway}.

After reviewing your application, we are unable to move forward with it at this time. We appreciate your interest and encourage you to apply again for a future cohort.

Regards,
DAAI Fellowship Team
""",
    ),
    ApplicationStatus.MORE_INFO: (
        "More information needed for your DAAI Fellowship application",
        """Hi {full_name},

Thank you for applying to the DAAI Fellowship for {pathway}.

We need a little more information before we can continue reviewing your application. Please reply to this email with any updated resume, supporting documents, or details you would like us to consider.

Regards,
DAAI Fellowship Team
""",
    ),
    ApplicationStatus.ENROLLED: (
        "Your DAAI Fellowship enrollment is confirmed",
        """Hi {full_name},

Your enrollment in the DAAI Fellowship for {pathway} has been confirmed.

Please watch for onboarding details, schedule information, and portal instructions from our team.

Regards,
DAAI Fellowship Team
""",
    ),
}


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

        previous_status = application.status
        application.status = payload.status
        application.updated_at = datetime.now(timezone.utc)
        await application.save()

        if previous_status != payload.status:
            await self._send_status_email(application)

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
            lastEmailStatus=application.last_email_status,
            lastEmailError=application.last_email_error,
            lastEmailSentAt=application.last_email_sent_at,
            createdAt=application.created_at,
            updatedAt=application.updated_at,
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

    @staticmethod
    async def _send_status_email(application: FellowshipApplication) -> None:
        email_template = STATUS_EMAILS.get(application.status)
        if email_template is None:
            return

        subject, body_template = email_template
        body = body_template.format(
            full_name=application.full_name,
            pathway=application.pathway,
        )
        result = await EmailService().send_email(
            to_email=application.email,
            subject=subject,
            body=body,
        )
        application.last_email_status = result.status
        application.last_email_error = result.error
        application.last_email_sent_at = (
            datetime.now(timezone.utc) if result.sent else None
        )
        application.updated_at = datetime.now(timezone.utc)
        await application.save()

        if not result.sent:
            logger.warning(
                "Application status email was not sent for application %s: %s",
                application.id,
                result.error,
            )
