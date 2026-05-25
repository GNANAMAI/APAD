from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_admin_user
from app.models.user import User
from app.schemas.user import UserRegister, UserResponse
from app.services import auth_engine

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return db.query(User).order_by(User.id.desc()).all()


@router.post("", response_model=UserResponse)
def create_user(
    data: UserRegister,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return auth_engine.register_user(db, data)
