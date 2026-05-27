"""Send personalized offer SMS with ad-preview link after login."""

import logging

from fastapi import HTTPException
from sqlalchemy.orm import Session
from twilio.base.exceptions import TwilioRestException

from app.config import get_settings
from app.models.generated_token import GeneratedToken
from app.models.user import User
from app.services.audience_matching import select_campaign_for_user
from app.services.sms_provider import get_sms_provider
from app.utils.phone import mask_mobile
from app.utils.security import generate_token_string
from app.utils.twilio_errors import log_twilio_error, twilio_http_status, twilio_user_message

logger = logging.getLogger(__name__)


def _build_ad_preview_url(token: str, from_login: bool = True) -> str:
    settings = get_settings()
    base = f"{settings.frontend_base_url.rstrip('/')}/ad-preview/{token}"
    if from_login:
        return f"{base}?from=login"
    return base


def _build_promo_line(campaign_promo: str, user_name: str) -> str:
    return campaign_promo.replace("{user_name}", user_name).strip()


def _build_login_message(user: User, promo: str, link: str) -> str:
    settings = get_settings()
    template = settings.login_link_message_template
    return (
        template.replace("{user_name}", user.name)
        .replace("{promo}", promo)
        .replace("{link}", link)
        .strip()
    )


async def send_login_link_sms(db: Session, user: User) -> dict:
    """Create token and send offer + ad-link SMS. Returns API payload for login."""
    settings = get_settings()
    if not settings.login_link_sms_enabled:
        raise HTTPException(status_code=503, detail="Login link SMS is disabled")

    campaign = select_campaign_for_user(db, user)
    if not campaign:
        raise HTTPException(status_code=404, detail="No active campaign")

    token_str = generate_token_string()
    db.add(
        GeneratedToken(
            token=token_str,
            user_id=user.id,
            campaign_id=campaign.id,
        )
    )
    db.commit()

    link = _build_ad_preview_url(token_str)
    promo = _build_promo_line(campaign.promo_suffix, user.name)
    body = _build_login_message(user, promo, link)

    provider = get_sms_provider()
    try:
        result = await provider.send_login_link(user.mobile, body)
    except TwilioRestException as exc:
        log_twilio_error(exc, "Login link SMS")
        raise HTTPException(
            status_code=twilio_http_status(exc),
            detail=twilio_user_message(exc),
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid mobile number") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    logger.info("Login link SMS for user %s (token %s…)", user.id, token_str[:8])

    return {
        "exists": True,
        "link_sent": True,
        "masked_mobile": mask_mobile(user.mobile),
        "token": token_str,
        "ad_preview_url": link,
        "sms_preview": result.preview_text or body,
        "requires_admin_login": False,
    }
