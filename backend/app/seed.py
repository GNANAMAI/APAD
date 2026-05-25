"""Seed demo admin, test user, and campaign catalog."""

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.user import User
from app.seed_campaigns import seed_campaign_catalog
from app.services.auth_engine import create_admin_if_needed


def seed_demo_data(db: Session) -> None:
    settings = get_settings()
    create_admin_if_needed(db, settings.admin_mobile, settings.admin_password)

    demo = db.query(User).filter(User.mobile == "9876543210").first()
    if demo is None:
        db.add(
            User(
                name="John Demo",
                mobile="9876543210",
                email="john.demo@example.com",
                age=28,
                gender="male",
                area="Hyderabad",
                role="user",
            )
        )
        db.commit()
    elif not demo.email:
        demo.email = "john.demo@example.com"
        db.commit()

    seed_campaign_catalog(db)
