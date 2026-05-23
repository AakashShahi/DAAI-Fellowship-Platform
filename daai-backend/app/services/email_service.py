import asyncio
import logging
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from email.utils import formataddr

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class EmailDeliveryResult:
    sent: bool
    status: str
    error: str | None = None


class EmailService:
    @property
    def is_configured(self) -> bool:
        return bool(settings.SMTP_HOST)

    async def send_email(
        self,
        *,
        to_email: str,
        subject: str,
        body: str,
    ) -> EmailDeliveryResult:
        if not self.is_configured:
            return EmailDeliveryResult(
                sent=False,
                status="skipped",
                error="SMTP_HOST is not configured.",
            )

        message = EmailMessage()
        message["From"] = formataddr(
            (settings.SMTP_FROM_NAME, settings.SMTP_FROM_EMAIL)
        )
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(body)

        try:
            await asyncio.to_thread(self._send_sync, message)
        except Exception as exc:
            logger.exception("Failed to send email to %s", to_email)
            return EmailDeliveryResult(
                sent=False,
                status="failed",
                error=str(exc),
            )

        return EmailDeliveryResult(sent=True, status="sent")

    @staticmethod
    def _send_sync(message: EmailMessage) -> None:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()

            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)

            smtp.send_message(message)
