from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserRegister
from app.utils.jwt import create_access_token
from app.utils.security import hash_password, verify_password


def register_user(db: Session, data: UserRegister) -> User:
    email = data.email.strip().lower()
    if db.query(User).filter(User.mobile == data.mobile).first():
        raise HTTPException(status_code=400, detail="Mobile number already registered")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        mobile=data.mobile,
        email=email,
        age=data.age,
        gender=data.gender,
        area=data.area,
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_lookup(db: Session, mobile: str) -> dict:
    user = db.query(User).filter(User.mobile == mobile).first()
    return {
        "exists": user is not None,
        "user_id": user.id if user else None,
        "name": user.name if user else None,
        "requires_admin_login": user is not None and user.role == "admin",
    }


def get_user_by_mobile(db: Session, mobile: str) -> User:
    user = db.query(User).filter(User.mobile == mobile).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def admin_login(db: Session, mobile: str, password: str) -> User:
    user = db.query(User).filter(User.mobile == mobile).first()
    if not user or user.role != "admin" or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid mobile or password")
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid mobile or password")
    return user


def create_admin_if_needed(db: Session, mobile: str, password: str) -> User:
    user = db.query(User).filter(User.mobile == mobile).first()
    if user:
        user.role = "admin"
        user.password_hash = hash_password(password)
        if not user.email:
            user.email = f"admin+{mobile}@apad.app"
        db.commit()
        db.refresh(user)
        return user

    admin_email = f"admin+{mobile}@apad.app"
    user = User(
        name="APAD Admin",
        mobile=mobile,
        email=admin_email,
        age=30,
        gender="any",
        area="HQ",
        role="admin",
        password_hash=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
