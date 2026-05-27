import asyncio
import logging
from dataclasses import dataclass

from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

from app.config import get_settings
from app.utils.phone import to_e164

logger = logging.getLogger(__name__)


@dataclass
class SendResult:
    delivered: bool
    channel: str
    preview_text: str | None = None


def build_sms_preview(mobile: str, otp: str, promo_line: str | None) -> str:
    suffix = f" {promo_line}" if promo_line else ""
    digits = "".join(c for c in mobile if c.isdigit())
    tail = digits[-4:] if len(digits) >= 4 else mobile
    return f"APAD: Your OTP is {otp} for ***{tail}.{suffix}"


class MockProvider:
    """POC: logs OTP; code is generated and verified in the database."""

    external_otp = False

    async def send_otp(self, mobile: str, otp: str, promo_line: str | None) -> SendResult:
        preview = build_sms_preview(mobile, otp, promo_line)
        logger.info("POC mock SMS -> %s | OTP %s", mobile, otp)
        return SendResult(delivered=False, channel="mock", preview_text=preview)

    async def send_login_link(self, mobile: str, body: str) -> SendResult:
        logger.info("POC mock login link SMS -> %s | %s", mobile, body)
        return SendResult(delivered=False, channel="mock", preview_text=body)

    def check_otp(self, mobile: str, code: str) -> bool:
        return False


class TwilioVerifyProvider:
    """Production: Twilio Verify sends and validates the OTP."""

    external_otp = True

    def __init__(self) -> None:
        settings = get_settings()
        if not (
            settings.twilio_account_sid
            and settings.twilio_auth_token
            and settings.twilio_verify_service_sid
        ):
            raise RuntimeError(
                "Twilio Verify requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, "
                "and TWILIO_VERIFY_SERVICE_SID"
            )
        self._client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        self._service_sid = settings.twilio_verify_service_sid
        self._channel = settings.twilio_otp_channel

    async def send_otp(self, mobile: str, otp: str, promo_line: str | None) -> SendResult:
        await asyncio.to_thread(self._send_sync, mobile)
        return SendResult(delivered=True, channel="twilio_verify")

    def _send_sync(self, mobile: str) -> None:
        e164 = to_e164(mobile)
        self._client.verify.v2.services(self._service_sid).verifications.create(
            to=e164,
            channel=self._channel,
        )
        logger.info("Twilio Verify OTP sent (ends %s)", e164[-4:])

    def check_otp(self, mobile: str, code: str) -> bool:
        e164 = to_e164(mobile)
        try:
            result = (
                self._client.verify.v2.services(self._service_sid)
                .verification_checks.create(to=e164, code=code)
            )
            return result.status == "approved"
        except TwilioRestException as exc:
            if exc.status == 404:
                return False
            raise

    async def send_login_link(self, mobile: str, body: str) -> SendResult:
        await asyncio.to_thread(self._send_login_link_sync, mobile, body)
        return SendResult(delivered=True, channel="twilio_messaging", preview_text=body)

    def _send_login_link_sync(self, mobile: str, body: str) -> None:
        settings = get_settings()
        if not settings.twilio_from_number:
            raise RuntimeError(
                "Login link SMS requires TWILIO_FROM_NUMBER (Twilio Programmable SMS)"
            )
        e164 = to_e164(mobile)
        self._client.messages.create(
            to=e164,
            from_=settings.twilio_from_number,
            body=body,
        )
        logger.info("Twilio login link SMS sent (ends %s)", e164[-4:])


def get_sms_provider() -> MockProvider | TwilioVerifyProvider:
    settings = get_settings()
    if settings.sms_provider.lower() == "twilio":
        return TwilioVerifyProvider()
    return MockProvider()
