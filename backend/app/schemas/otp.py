from pydantic import BaseModel, field_validator

from app.schemas.user import UserResponse
from app.utils.phone import normalize_mobile


class VerifyOtpRequest(BaseModel):
    mobile: str
    otp: str

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        return normalize_mobile(v)


class SendOtpRequest(BaseModel):
    mobile: str
    token: str | None = None

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        return normalize_mobile(v)


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
