from app.models.campaign import Campaign
from app.models.user import User
from app.services.ad_context import resolve_context, resolve_context_for_gate

__all__ = ["resolve_context", "resolve_context_for_gate", "get_watch_payload"]


def get_watch_payload(user: User, campaign: Campaign, gate: str) -> dict:
    return {
        "gate": gate,
        "campaign_id": campaign.id,
        "campaign_name": campaign.name,
        "user_mobile": user.mobile,
        "user_name": user.name,
        "personalized_title": campaign.title_template,
        "description": campaign.description,
        "image_url": campaign.image_url,
        "creative_url": campaign.creative_url,
        "creative_type": campaign.creative_type,
        "min_watch_seconds": campaign.min_watch_seconds,
    }
