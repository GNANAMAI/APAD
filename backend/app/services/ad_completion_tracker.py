from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.ad_completion import AdCompletion
from app.models.otp_log import OtpLog
from app.services.ad_gates import GATE_LOGIN, GATE_OTP_REQUEST, VALID_GATES


def _completion_query(db: Session, user_id: int, token: str | None, gate: str):
    now = datetime.now(timezone.utc)
    q = db.query(AdCompletion).filter(
        AdCompletion.user_id == user_id,
        AdCompletion.gate == gate,
        AdCompletion.expires_at > now,
    )
    if token:
        q = q.filter(AdCompletion.token == token)
    return q


def has_valid_completion(
    db: Session, user_id: int, token: str | None, gate: str = GATE_OTP_REQUEST
) -> bool:
    return _completion_query(db, user_id, token, gate).first() is not None


def has_recent_otp_sent(db: Session, user_id: int) -> bool:
    now = datetime.now(timezone.utc)
    return (
        db.query(OtpLog)
        .filter(
            OtpLog.user_id == user_id,
            OtpLog.status == "sent",
            OtpLog.expires_at > now,
        )
        .first()
        is not None
    )


def get_flow_status(db: Session, user_id: int, token: str | None) -> dict:
    return {
        "login_ad_completed": has_valid_completion(db, user_id, token, GATE_LOGIN),
        "otp_ad_completed": has_valid_completion(db, user_id, token, GATE_OTP_REQUEST),
        "otp_sent": has_recent_otp_sent(db, user_id),
    }


def completed_campaign_ids(
    db: Session, user_id: int, token: str | None, gate: str
) -> list[int]:
    now = datetime.now(timezone.utc)
    q = db.query(AdCompletion.campaign_id).filter(
        AdCompletion.user_id == user_id,
        AdCompletion.gate == gate,
        AdCompletion.expires_at > now,
    )
    if token:
        q = q.filter(AdCompletion.token == token)
    return [row[0] for row in q.all()]


def record_completion(
    db: Session,
    mobile: str | None,
    token: str | None,
    watch_duration: int,
    gate: str,
) -> AdCompletion:
    if gate not in VALID_GATES:
        raise HTTPException(status_code=400, detail="Invalid ad gate")

    from app.services.ad_context import resolve_context_for_gate

    settings = get_settings()
    user, campaign, token_val = resolve_context_for_gate(db, token, mobile, gate)

    if gate == GATE_OTP_REQUEST and not has_valid_completion(
        db, user.id, token_val, GATE_LOGIN
    ):
        raise HTTPException(
            status_code=403,
            detail="Please finish watching the offer before continuing",
        )

    if watch_duration < campaign.min_watch_seconds:
        raise HTTPException(
            status_code=400,
            detail=f"Watch at least {campaign.min_watch_seconds} seconds",
        )

    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=settings.ad_completion_ttl_minutes)

    existing = _completion_query(db, user.id, token_val, gate).first()
    if existing:
        existing.campaign_id = campaign.id
        existing.watch_duration = watch_duration
        existing.completed_at = now
        existing.expires_at = expires
        db.commit()
        db.refresh(existing)
        return existing

    row = AdCompletion(
        user_id=user.id,
        campaign_id=campaign.id,
        token=token_val,
        gate=gate,
        watch_duration=watch_duration,
        completed_at=now,
        expires_at=expires,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
