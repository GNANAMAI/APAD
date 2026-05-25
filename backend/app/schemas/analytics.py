from pydantic import BaseModel


class TrackEventRequest(BaseModel):
    event_type: str
    token: str | None = None
    user_id: int | None = None
    metadata: dict | None = None


class AnalyticsSummary(BaseModel):
    event_type: str
    count: int
