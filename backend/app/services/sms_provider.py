import logging
from dataclasses import dataclass

from app.config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class SendResult:
    delivered: bool
    channel: str
    preview_text: str | None = None


def build_sms_preview(mobile: str, otp: str, promo_line: str | None) -> str:
    suffix = f" {promo_line}" if promo_line else ""
    return f"APAD: Your OTP is {otp} for {mobile[-10:]}.{suffix}"


class MockProvider:
    async def send_otp(self, mobile: str, otp: str, promo_line: str | None) -> SendResult:
        preview = build_sms_preview(mobile, otp, promo_line)
        logger.info("POC mock SMS -> %s | OTP %s | %s", mobile, otp, preview)
        return SendResult(delivered=False, channel="poc_ui", preview_text=preview)


def get_sms_provider():
    settings = get_settings()
    if settings.sms_provider == "mock":
        return MockProvider()
    return MockProvider()
