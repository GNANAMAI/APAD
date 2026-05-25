from sqlalchemy.orm import Session, joinedload

from app.models.campaign import Campaign, TargetingRule
from app.models.user import User


def user_matches_rule(user: User, rule: TargetingRule) -> bool:
    if user.age < rule.min_age or user.age > rule.max_age:
        return False
    if rule.gender != "any" and user.gender.lower() != rule.gender.lower():
        return False
    if rule.area != "any" and user.area.lower() != rule.area.lower():
        return False
    return True


def campaign_matches_user(campaign: Campaign, user: User) -> bool:
    rules = campaign.targeting_rules
    if not rules:
        return True
    return any(user_matches_rule(user, rule) for rule in rules)


def get_matching_campaigns(db: Session, user: User) -> list[Campaign]:
    campaigns = (
        db.query(Campaign)
        .options(joinedload(Campaign.targeting_rules))
        .filter(Campaign.is_active.is_(True))
        .all()
    )
    return [c for c in campaigns if campaign_matches_user(c, user)]


def select_campaign_for_user(
    db: Session, user: User, exclude_ids: list[int] | None = None
) -> Campaign | None:
    all_matches = get_matching_campaigns(db, user)
    matches = all_matches
    if exclude_ids:
        matches = [c for c in all_matches if c.id not in exclude_ids]
    if not matches and all_matches:
        matches = all_matches
    if not matches:
        return (
            db.query(Campaign)
            .options(joinedload(Campaign.targeting_rules))
            .filter(Campaign.is_active.is_(True), Campaign.name == "General Offers")
            .first()
        )
    return max(matches, key=lambda c: (c.priority, -c.id))


def get_matching_users(db: Session, campaign_id: int) -> list[User]:
    campaign = (
        db.query(Campaign)
        .options(joinedload(Campaign.targeting_rules))
        .filter(Campaign.id == campaign_id)
        .first()
    )
    if not campaign:
        return []

    users = db.query(User).filter(User.role == "user").all()
    return [u for u in users if campaign_matches_user(campaign, u)]
