import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    triggered_by: Mapped[str | None] = mapped_column(String(50))  # 'scheduler'|'manual'
    market_risk_level: Mapped[str | None] = mapped_column(String(20))  # LOW|MEDIUM|HIGH|CRITICAL
    risk_score: Mapped[int | None] = mapped_column(Integer)
    summary: Mapped[str | None] = mapped_column(Text)
    full_reasoning: Mapped[str | None] = mapped_column(Text)
    per_position: Mapped[dict | None] = mapped_column(JSONB)
    key_themes: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    top_risks: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    news_ids_used: Mapped[list[uuid.UUID] | None] = mapped_column(ARRAY(UUID(as_uuid=True)))
    portfolio_snapshot_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portfolio_snapshots.id", ondelete="SET NULL"), nullable=True
    )
    tokens_used: Mapped[int | None] = mapped_column(Integer)
    cached_tokens: Mapped[int | None] = mapped_column(Integer)
