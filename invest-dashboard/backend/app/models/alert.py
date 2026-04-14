import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    alert_type: Mapped[str | None] = mapped_column(String(50))  # PRICE_ALERT|AI_SIGNAL|NEWS_KEYWORD|RISK_LEVEL
    severity: Mapped[str | None] = mapped_column(String(20))    # INFO|WARNING|CRITICAL
    title: Mapped[str | None] = mapped_column(String(255))
    message: Mapped[str | None] = mapped_column(Text)
    ticker: Mapped[str | None] = mapped_column(String(20))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB)
