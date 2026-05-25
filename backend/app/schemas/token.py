from pydantic import BaseModel


class GenerateTokenRequest(BaseModel):
    campaign_id: int
    user_ids: list[int] | None = None
    match_audience: bool = True


class TokenLinkResponse(BaseModel):
    token: str
    user_id: int
    user_name: str
    url: str


class GenerateTokenResponse(BaseModel):
    links: list[TokenLinkResponse]
