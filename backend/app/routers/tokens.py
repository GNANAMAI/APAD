from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_admin_user
from app.models.user import User
from app.schemas.token import GenerateTokenRequest, GenerateTokenResponse, TokenLinkResponse
from app.services import analytics_engine, token_generator

router = APIRouter(prefix="/tokens", tags=["tokens"])


@router.post("/generate-token", response_model=GenerateTokenResponse)
def generate_token(
    data: GenerateTokenRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    links = token_generator.generate_tokens_for_campaign(
        db,
        data.campaign_id,
        user_ids=data.user_ids,
        match_audience=data.match_audience,
    )
    for link in links:
        analytics_engine.track_event(db, "token_generated", token=link["token"])
    return GenerateTokenResponse(
        links=[TokenLinkResponse(**link) for link in links]
    )
