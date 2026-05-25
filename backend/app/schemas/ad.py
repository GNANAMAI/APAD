from pydantic import BaseModel


class AdWatchResponse(BaseModel):
    gate: str
    campaign_id: int
    campaign_name: str
    user_mobile: str
    user_name: str
    personalized_title: str
    description: str
    image_url: str
    creative_url: str
    creative_type: str
    min_watch_seconds: int


class AdCompletedRequest(BaseModel):
    mobile: str | None = None
    token: str | None = None
    watch_duration: int = 0
    gate: str = "login"


class AdCompletedResponse(BaseModel):
    gate: str
    login_ad_completed: bool
    otp_ad_completed: bool
    message: str


class AdFlowStatusResponse(BaseModel):
    login_ad_completed: bool
    otp_ad_completed: bool


class AdProgressRequest(BaseModel):
    mobile: str | None = None
    token: str | None = None
    seconds_watched: int = 0
