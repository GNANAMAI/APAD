from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    title_template: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str] = mapped_column(String(500))
    creative_url: Mapped[str] = mapped_column(String(500))
    creative_type: Mapped[str] = mapped_column(String(20), default="video")
    min_watch_seconds: Mapped[int] = mapped_column(Integer, default=5)
    promo_suffix: Mapped[str] = mapped_column(String(255), default="")
    priority: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    targeting_rules = relationship("TargetingRule", back_populates="campaign")
    tokens = relationship("GeneratedToken", back_populates="campaign")


class TargetingRule(Base):
    __tablename__ = "targeting_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"))
    min_age: Mapped[int] = mapped_column(Integer, default=0)
    max_age: Mapped[int] = mapped_column(Integer, default=120)
    gender: Mapped[str] = mapped_column(String(20), default="any")
    area: Mapped[str] = mapped_column(String(120), default="any")

    campaign = relationship("Campaign", back_populates="targeting_rules")
