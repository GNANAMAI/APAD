from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ad import (
    AdCompletedRequest,
    AdCompletedResponse,
    AdFlowStatusResponse,
    AdWatchResponse,
)
from app.services import ad_delivery, ad_completion_tracker, analytics_engine
from app.services.ad_context import resolve_context_for_gate
from app.services.ad_gates import GATE_LOGIN, GATE_OTP_REQUEST, VALID_GATES

router = APIRouter(prefix="/ad", tags=["ads"])


@router.get("/status", response_model=AdFlowStatusResponse)
def ad_flow_status(
    token: str | None = Query(None),
    mobile: str | None = Query(None),
    db: Session = Depends(get_db),
):
    user, _, token_val = resolve_context_for_gate(db, token, mobile, GATE_LOGIN)
    return ad_completion_tracker.get_flow_status(db, user.id, token_val)


@router.get("/watch", response_model=AdWatchResponse)
def watch_ad(
    token: str | None = Query(None),
    mobile: str | None = Query(None),
    gate: str = Query(GATE_LOGIN),
    db: Session = Depends(get_db),
):
    if gate not in VALID_GATES:
        raise HTTPException(status_code=400, detail="Invalid ad gate")
    user, campaign, token_val = resolve_context_for_gate(db, token, mobile, gate)
    analytics_engine.track_event(
        db, "ad_impression", user_id=user.id, token=token_val, metadata={"gate": gate}
    )
    return ad_delivery.get_watch_payload(user, campaign, gate)


@router.post("/completed", response_model=AdCompletedResponse)
def ad_completed(data: AdCompletedRequest, db: Session = Depends(get_db)):
    ad_completion_tracker.record_completion(
        db, data.mobile, data.token, data.watch_duration, data.gate
    )
    user, _, token_val = resolve_context_for_gate(
        db, data.token, data.mobile, GATE_LOGIN
    )
    status = ad_completion_tracker.get_flow_status(db, user.id, token_val)
    analytics_engine.track_event(
        db, "ad_completed", user_id=user.id, token=token_val, metadata={"gate": data.gate}
    )
    return AdCompletedResponse(
        gate=data.gate,
        login_ad_completed=status["login_ad_completed"],
        otp_ad_completed=status["otp_ad_completed"],
        message="OK",
    )
