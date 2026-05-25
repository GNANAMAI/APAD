from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_admin_user, security
from app.models.user import User
from app.schemas.analytics import AnalyticsSummary, TrackEventRequest
from app.services import analytics_engine
from app.utils.jwt import decode_access_token

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _optional_user_id(
    credentials: HTTPAuthorizationCredentials | None,
    db: Session,
    fallback: int | None,
) -> int | None:
    if fallback is not None:
        return fallback
    if not credentials:
        return None
    payload = decode_access_token(credentials.credentials)
    if payload:
        return int(payload["sub"])
    return None


@router.post("/track-event")
def track_event(
    data: TrackEventRequest,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    uid = _optional_user_id(credentials, db, data.user_id)
    analytics_engine.track_event(
        db, data.event_type, user_id=uid, token=data.token, metadata=data.metadata
    )
    return {"ok": True}


@router.post("/track-event/public")
def track_event_public(data: TrackEventRequest, db: Session = Depends(get_db)):
    analytics_engine.track_event(
        db, data.event_type, user_id=data.user_id, token=data.token, metadata=data.metadata
    )
    return {"ok": True}


@router.get("", response_model=list[AnalyticsSummary])
def analytics_summary(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    rows = analytics_engine.get_summary(db)
    return [AnalyticsSummary(**r) for r in rows]
