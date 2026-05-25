from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AdCompletion(Base):
    __tablename__ = "ad_completions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"))
    token: Mapped[str | None] = mapped_column(String(64), nullable=True)
    gate: Mapped[str] = mapped_column(String(32), default="login", index=True)
    watch_duration: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    user = relationship("User", back_populates="ad_completions")
