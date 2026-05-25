from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.generated_token import GeneratedToken
from app.models.user import User
from app.services import analytics_engine, og_metadata
from app.services.audience_matching import select_campaign_for_user
from app.utils.user_agent import is_crawler

router = APIRouter(tags=["preview"])


@router.get("/preview/{token}")
def preview_token(token: str, request: Request, db: Session = Depends(get_db)):
    row = db.query(GeneratedToken).filter(GeneratedToken.token == token).first()
    if not row:
        return HTMLResponse("<h1>Invalid link</h1>", status_code=404)

    user = db.query(User).filter(User.id == row.user_id).first()
    if not user:
        return HTMLResponse("<h1>Not found</h1>", status_code=404)
    campaign = select_campaign_for_user(db, user)
    if not campaign:
        return HTMLResponse("<h1>No campaign available</h1>", status_code=404)

    analytics_engine.track_event(db, "preview_fetch", user_id=user.id, token=token)

    ua = request.headers.get("user-agent")
    if is_crawler(ua):
        html = og_metadata.build_og_html(row, user, campaign)
        return HTMLResponse(content=html)

    from app.config import get_settings

    settings = get_settings()
    return RedirectResponse(f"{settings.frontend_base_url}/ad-preview/{token}")
