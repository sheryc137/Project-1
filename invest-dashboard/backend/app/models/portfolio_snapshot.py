import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Numeric, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    total_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    buying_power: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    total_pnl: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    total_pnl_pct: Mapped[float | None]
    positions: Mapped[dict | None] = mapped_column(JSONB)
    watchlist: Mapped[dict | None] = mapped_column(JSONB)
