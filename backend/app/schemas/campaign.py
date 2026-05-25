from pydantic import BaseModel, Field


class TargetingRuleCreate(BaseModel):
    min_age: int = 0
    max_age: int = 120
    gender: str = "any"
    area: str = "any"


class CampaignCreate(BaseModel):
    name: str
    title_template: str
    description: str
    image_url: str
    creative_url: str
    creative_type: str = "video"
    min_watch_seconds: int = 5
    promo_suffix: str = ""
    priority: int = 0
    targeting_rules: list[TargetingRuleCreate] = Field(default_factory=list)


class TargetingRuleResponse(BaseModel):
    id: int
    min_age: int
    max_age: int
    gender: str
    area: str

    model_config = {"from_attributes": True}


class CampaignRecommendation(BaseModel):
    id: int
    name: str
    personalized_title: str


class CampaignResponse(BaseModel):
    id: int
    name: str
    title_template: str
    description: str
    image_url: str
    creative_url: str
    creative_type: str
    min_watch_seconds: int
    promo_suffix: str
    priority: int
    is_active: bool
    targeting_rules: list[TargetingRuleResponse] = []

    model_config = {"from_attributes": True}
