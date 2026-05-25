from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.otp_log import OtpLog
from app.models.user import User
from app.services.ad_completion_tracker import has_valid_completion
from app.services.ad_gates import GATE_OTP_REQUEST
from app.services.ad_context import resolve_context_for_gate
from app.services.sms_provider import get_sms_provider
from app.utils.security import generate_otp, mask_mobile


async def send_otp(db: Session, mobile: str, token: str | None) -> dict:
    settings = get_settings()
    user, campaign, token_val = resolve_context_for_gate(
        db, token, mobile, GATE_OTP_REQUEST
    )

    if not has_valid_completion(db, user.id, token_val, GATE_OTP_REQUEST):
        raise HTTPException(
            status_code=403,
            detail="Please finish watching the sponsored message to receive your code",
        )

    code = generate_otp(settings.otp_length)
    now = datetime.now(timezone.utc)
    expires = now + timedelta(seconds=settings.otp_ttl_seconds)

    db.add(
        OtpLog(
            user_id=user.id,
            otp=code,
            status="sent",
            expires_at=expires,
        )
    )
    db.commit()

    promo = personalize_promo(campaign.promo_suffix, user.name, token_val)
    provider = get_sms_provider()
    result = await provider.send_otp(user.mobile, code, promo)

    response = {
        "masked_mobile": mask_mobile(user.mobile),
        "expires_in": settings.otp_ttl_seconds,
        "message": "Verification code sent successfully",
        "otp_for_screen": None,
        "sms_preview": result.preview_text,
    }

    if settings.otp_show_on_screen or settings.otp_simulation_mode:
        response["otp_for_screen"] = code
        response["sms_preview"] = result.preview_text or build_preview(user, code, promo, token_val)

    return response


def personalize_promo(suffix: str, name: str, token: str | None) -> str:
    settings = get_settings()
    text = suffix.replace("{user_name}", name)
    if token:
        text += f" Link: {settings.frontend_base_url}/ad-preview/{token}"
    return text.strip()


def build_preview(user: User, otp: str, promo: str, token: str | None) -> str:
    settings = get_settings()
    link = f"{settings.frontend_base_url}/ad-preview/{token}" if token else settings.frontend_base_url
    return f"Hi {user.name}, your APAD OTP is {otp}. {promo} {link}".strip()


def verify_otp(db: Session, mobile: str, otp: str) -> User:
    user = db.query(User).filter(User.mobile == mobile).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.now(timezone.utc)
    log = (
        db.query(OtpLog)
        .filter(
            OtpLog.user_id == user.id,
            OtpLog.otp == otp,
            OtpLog.status == "sent",
            OtpLog.expires_at > now,
        )
        .order_by(OtpLog.id.desc())
        .first()
    )
    if not log:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    log.status = "verified"
    db.commit()
    return user
