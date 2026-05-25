from app.config import get_settings
from app.models.campaign import Campaign
from app.models.generated_token import GeneratedToken
from app.models.user import User


def personalize(template: str, user_name: str) -> str:
    return template.replace("{user_name}", user_name).replace("{name}", user_name)


def build_og_html(token_row: GeneratedToken, user: User, campaign: Campaign) -> str:
    settings = get_settings()
    title = personalize(campaign.title_template, user.name)
    description = personalize(campaign.description, user.name)
    image = campaign.image_url
    url = f"{settings.frontend_base_url}/ad-preview/{token_row.token}"

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:image" content="{image}" />
  <meta property="og:url" content="{url}" />
  <meta http-equiv="refresh" content="0;url={url}" />
  <title>{title}</title>
</head>
<body>
  <p>Redirecting to APAD...</p>
  <a href="{url}">Continue</a>
</body>
</html>"""
