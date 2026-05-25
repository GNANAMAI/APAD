import json

from sqlalchemy.orm import Session

from app.models.analytics_event import AnalyticsEvent


def track_event(
    db: Session,
    event_type: str,
    user_id: int | None = None,
    token: str | None = None,
    metadata: dict | None = None,
) -> None:
    db.add(
        AnalyticsEvent(
            event_type=event_type,
            user_id=user_id,
            token=token,
            metadata_json=json.dumps(metadata) if metadata else None,
        )
    )
    db.commit()


def get_summary(db: Session) -> list[dict]:
    from sqlalchemy import func

    rows = (
        db.query(AnalyticsEvent.event_type, func.count(AnalyticsEvent.id))
        .group_by(AnalyticsEvent.event_type)
        .all()
    )
    return [{"event_type": r[0], "count": r[1]} for r in rows]
