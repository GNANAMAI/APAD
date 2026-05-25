from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.generated_token import GeneratedToken
from app.models.user import User
from app.services.audience_matching import get_matching_users
from app.utils.security import generate_token_string


def generate_tokens_for_campaign(
    db: Session,
    campaign_id: int,
    user_ids: list[int] | None = None,
    match_audience: bool = True,
) -> list[dict]:
    settings = get_settings()
    if user_ids:
        users = db.query(User).filter(User.id.in_(user_ids)).all()
    elif match_audience:
        users = get_matching_users(db, campaign_id)
    else:
        users = db.query(User).filter(User.role == "user").all()

    links = []
    for user in users:
        token_str = generate_token_string()
        row = GeneratedToken(token=token_str, user_id=user.id, campaign_id=campaign_id)
        db.add(row)
        links.append(
            {
                "token": token_str,
                "user_id": user.id,
                "user_name": user.name,
                "url": f"{settings.frontend_base_url}/ad-preview/{token_str}",
            }
        )
    db.commit()
    return links
