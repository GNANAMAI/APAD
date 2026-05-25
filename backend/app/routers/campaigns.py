from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_admin_user, get_current_user
from app.models.campaign import Campaign, TargetingRule
from app.models.user import User
from app.schemas.campaign import CampaignCreate, CampaignRecommendation, CampaignResponse
from app.services import analytics_engine
from app.services.audience_matching import get_matching_campaigns, get_matching_users

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.post("/create", response_model=CampaignResponse)
def create_campaign(
    data: CampaignCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    campaign = Campaign(
        name=data.name,
        title_template=data.title_template,
        description=data.description,
        image_url=data.image_url,
        creative_url=data.creative_url,
        creative_type=data.creative_type,
        min_watch_seconds=data.min_watch_seconds,
        promo_suffix=data.promo_suffix,
        priority=data.priority,
    )
    db.add(campaign)
    db.flush()

    for rule in data.targeting_rules:
        db.add(
            TargetingRule(
                campaign_id=campaign.id,
                min_age=rule.min_age,
                max_age=rule.max_age,
                gender=rule.gender,
                area=rule.area,
            )
        )
    db.commit()
    db.refresh(campaign)
    analytics_engine.track_event(db, "campaign_created", metadata={"campaign_id": campaign.id})
    return campaign


@router.get("", response_model=list[CampaignResponse])
def list_campaigns(db: Session = Depends(get_db)):
    return (
        db.query(Campaign)
        .options(joinedload(Campaign.targeting_rules))
        .order_by(Campaign.priority.desc(), Campaign.id.desc())
        .all()
    )


@router.get("/for-me", response_model=list[CampaignRecommendation])
def campaigns_for_me(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    campaigns = get_matching_campaigns(db, user)
    campaigns.sort(key=lambda c: (-c.priority, c.id))
    return [
        CampaignRecommendation(
            id=c.id,
            name=c.name,
            personalized_title=c.title_template,
        )
        for c in campaigns
    ]


@router.get("/{campaign_id}/audience-size")
def campaign_audience_size(
    campaign_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return {"count": len(get_matching_users(db, campaign_id))}
