from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.otp import VerifyOtpRequest, VerifyOtpResponse
from app.schemas.user import AdminLoginRequest, UserLogin, UserRegister, UserResponse
from app.services import analytics_engine, auth_engine, otp_engine
from app.utils.jwt import create_access_token

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    user = auth_engine.register_user(db, data)
    analytics_engine.track_event(db, "user_registered", user_id=user.id)
    return user


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    result = auth_engine.login_lookup(db, data.mobile)
    analytics_engine.track_event(db, "login_lookup", metadata={"mobile": data.mobile})
    return result


@router.post("/auth/admin-login", response_model=VerifyOtpResponse)
def admin_login(data: AdminLoginRequest, db: Session = Depends(get_db)):
    user = auth_engine.admin_login(db, data.mobile, data.password)
    token = create_access_token(user.id, user.role)
    analytics_engine.track_event(db, "admin_login", user_id=user.id)
    return VerifyOtpResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/verify-otp", response_model=VerifyOtpResponse)
def verify_otp(data: VerifyOtpRequest, db: Session = Depends(get_db)):
    user = otp_engine.verify_otp(db, data.mobile, data.otp)
    token = create_access_token(user.id, user.role)
    analytics_engine.track_event(db, "otp_verified", user_id=user.id)
    analytics_engine.track_event(db, "login_success", user_id=user.id)
    return VerifyOtpResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
