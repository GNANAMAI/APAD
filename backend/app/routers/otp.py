from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.otp import SendOtpRequest, SendOtpResponse, VerifyOtpRequest, VerifyOtpResponse
from app.schemas.user import UserResponse
from app.services import analytics_engine, otp_engine
from app.utils.jwt import create_access_token

router = APIRouter(prefix="/otp", tags=["otp"])


@router.post("/send-otp", response_model=SendOtpResponse)
async def send_otp(data: SendOtpRequest, db: Session = Depends(get_db)):
    result = await otp_engine.send_otp(db, data.mobile, data.token)
    from app.models.user import User

    user = db.query(User).filter(User.mobile == data.mobile).first()
    if user:
        analytics_engine.track_event(db, "otp_requested", user_id=user.id, token=data.token)
        analytics_engine.track_event(db, "otp_generated", user_id=user.id, token=data.token)
    return SendOtpResponse(**result)


@router.post("/verify-otp", response_model=VerifyOtpResponse)
def verify_otp_route(data: VerifyOtpRequest, db: Session = Depends(get_db)):
    user = otp_engine.verify_otp(db, data.mobile, data.otp)
    token = create_access_token(user.id, user.role)
    analytics_engine.track_event(db, "otp_verified", user_id=user.id)
    analytics_engine.track_event(db, "login_success", user_id=user.id)
    return VerifyOtpResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
