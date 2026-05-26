from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session
from twilio.base.exceptions import TwilioRestException

from app.config import get_settings
from app.utils.twilio_errors import log_twilio_error, twilio_http_status, twilio_user_message
from app.models.otp_log import OtpLog
from app.models.user import User
from app.services.ad_completion_tracker import has_valid_completion
from app.services.ad_gates import GATE_OTP_REQUEST
from app.services.ad_context import resolve_context_for_gate
from app.services.sms_provider import get_sms_provider
from app.utils.phone import mask_mobile, normalize_mobile
from app.utils.security import generate_otp

_EXTERNAL_OTP_PLACEHOLDER = "twilio"


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

    provider = get_sms_provider()
    now = datetime.now(timezone.utc)
    expires = now + timedelta(seconds=settings.otp_ttl_seconds)

    if provider.external_otp:
        try:
            await provider.send_otp(user.mobile, "", None)
        except TwilioRestException as exc:
            log_twilio_error(exc, "Verify send")
            raise HTTPException(
                status_code=twilio_http_status(exc),
                detail=twilio_user_message(exc),
            ) from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid mobile number") from exc

        db.add(
            OtpLog(
                user_id=user.id,
                otp=_EXTERNAL_OTP_PLACEHOLDER,
                status="sent",
                expires_at=expires,
            )
        )
        db.commit()
        return _build_send_response(user.mobile, settings, None, None)

    code = generate_otp(settings.otp_length)
    promo = _personalize_promo(campaign.promo_suffix, user.name, token_val)

    db.add(
        OtpLog(
            user_id=user.id,
            otp=code,
            status="sent",
            expires_at=expires,
        )
    )
    db.commit()

    result = await provider.send_otp(user.mobile, code, promo)
    preview = result.preview_text
    otp_for_screen = None

    if settings.otp_show_on_screen or settings.otp_simulation_mode:
        otp_for_screen = code
        preview = preview or _build_preview(user, code, promo, token_val)

    return _build_send_response(user.mobile, settings, otp_for_screen, preview)


def verify_otp(db: Session, mobile: str, otp: str) -> User:
    try:
        mobile = normalize_mobile(mobile)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid mobile number") from exc

    user = db.query(User).filter(User.mobile == mobile).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    provider = get_sms_provider()
    now = datetime.now(timezone.utc)

    if provider.external_otp:
        log = (
            db.query(OtpLog)
            .filter(
                OtpLog.user_id == user.id,
                OtpLog.status == "sent",
                OtpLog.expires_at > now,
            )
            .order_by(OtpLog.id.desc())
            .first()
        )
        if not log:
            raise HTTPException(
                status_code=400,
                detail="No active verification. Please request a new code.",
            )
        try:
            approved = provider.check_otp(mobile, otp)
        except TwilioRestException as exc:
            log_twilio_error(exc, "Verify check")
            if exc.status == 404:
                return False
            raise HTTPException(
                status_code=twilio_http_status(exc),
                detail=twilio_user_message(exc),
            ) from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid mobile number") from exc

        if not approved:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        log.status = "verified"
        db.commit()
        return user

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


def _build_send_response(
    mobile: str,
    settings,
    otp_for_screen: str | None,
    sms_preview: str | None,
) -> dict:
    return {
        "masked_mobile": mask_mobile(mobile),
        "expires_in": settings.otp_ttl_seconds,
        "message": "Verification code sent successfully",
        "otp_for_screen": otp_for_screen,
        "sms_preview": sms_preview,
    }


def _personalize_promo(suffix: str, name: str, token: str | None) -> str:
    settings = get_settings()
    text = suffix.replace("{user_name}", name)
    if token:
        text += f" Link: {settings.frontend_base_url}/ad-preview/{token}"
    return text.strip()


def _build_preview(user: User, otp: str, promo: str, token: str | None) -> str:
    settings = get_settings()
    link = (
        f"{settings.frontend_base_url}/ad-preview/{token}"
        if token
        else settings.frontend_base_url
    )
    return f"Hi {user.name}, your APAD OTP is {otp}. {promo} {link}".strip()
