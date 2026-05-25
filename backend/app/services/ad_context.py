"""Resolve user + campaign for an ad gate (no completion writes — avoids import cycles)."""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.campaign import Campaign
from app.models.generated_token import GeneratedToken
from app.models.user import User
from app.services.ad_completion_tracker import completed_campaign_ids
from app.services.ad_gates import GATE_LOGIN, GATE_OTP_REQUEST, VALID_GATES
from app.services.audience_matching import select_campaign_for_user


def _load_user_from_token(db: Session, token: str) -> User:
    row = db.query(GeneratedToken).filter(GeneratedToken.token == token).first()
    if not row:
        raise HTTPException(status_code=404, detail="Invalid token")
    user = db.query(User).filter(User.id == row.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _resolve_user(db: Session, token: str | None, mobile: str | None) -> User:
    if token:
        return _load_user_from_token(db, token)
    if mobile:
        user = db.query(User).filter(User.mobile == mobile).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    raise HTTPException(status_code=400, detail="Provide token or mobile")


def _campaign_for_gate(db: Session, user: User, gate: str, token_val: str | None) -> Campaign:
    exclude: list[int] = []
    if gate == GATE_OTP_REQUEST:
        exclude = completed_campaign_ids(db, user.id, token_val, GATE_LOGIN)

    campaign = select_campaign_for_user(db, user, exclude_ids=exclude or None)
    if not campaign:
        raise HTTPException(status_code=404, detail="No active campaign")
    return campaign


def resolve_context_for_gate(
    db: Session, token: str | None, mobile: str | None, gate: str
) -> tuple[User, Campaign, str | None]:
    if gate not in VALID_GATES:
        raise HTTPException(status_code=400, detail="Invalid ad gate")

    if gate == GATE_OTP_REQUEST:
        user = _resolve_user(db, token, mobile)
        token_val = token if token else None
        if not completed_campaign_ids(db, user.id, token_val, GATE_LOGIN):
            raise HTTPException(
                status_code=403,
                detail="Please finish watching the offer before continuing",
            )
        return user, _campaign_for_gate(db, user, gate, token_val), token_val

    user = _resolve_user(db, token, mobile)
    return user, _campaign_for_gate(db, user, gate, token if token else None), (
        token if token else None
    )


def resolve_context(
    db: Session, token: str | None, mobile: str | None
) -> tuple[User, Campaign, str | None]:
    return resolve_context_for_gate(db, token, mobile, GATE_LOGIN)
