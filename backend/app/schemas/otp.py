from pydantic import BaseModel

from app.schemas.user import UserResponse


class VerifyOtpRequest(BaseModel):
    mobile: str
    otp: str


class SendOtpRequest(BaseModel):
    mobile: str
    token: str | None = None


class SendOtpResponse(BaseModel):
    masked_mobile: str
    expires_in: int
    message: str
    otp_for_screen: str | None = None
    sms_preview: str | None = None


class VerifyOtpResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
