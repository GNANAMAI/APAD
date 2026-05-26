"""Seed demo admin, test user, and campaign catalog."""

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.user import User
from app.seed_campaigns import seed_campaign_catalog
from app.services.auth_engine import create_admin_if_needed
from app.utils.phone import normalize_mobile


def seed_demo_data(db: Session) -> None:
    settings = get_settings()
    admin_mobile = normalize_mobile(settings.admin_mobile)
    create_admin_if_needed(db, admin_mobile, settings.admin_password)

    demo_mobile = "+919876543210"
    demo = (
        db.query(User)
        .filter(User.mobile.in_([demo_mobile, "9876543210"]))
        .first()
    )
    if demo is None:
        db.add(
            User(
                name="John Demo",
                mobile=demo_mobile,
                email="john.demo@example.com",
                age=28,
                gender="male",
                area="Hyderabad",
                role="user",
            )
        )
        db.commit()
    else:
        if demo.mobile != demo_mobile:
            demo.mobile = demo_mobile
        if not demo.email:
            demo.email = "john.demo@example.com"
        db.commit()

    seed_campaign_catalog(db)
