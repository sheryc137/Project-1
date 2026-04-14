import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class PortfolioSnapshotOut(BaseModel):
    id: uuid.UUID
    fetched_at: datetime
    total_value: Decimal | None
    buying_power: Decimal | None
    total_pnl: Decimal | None
    total_pnl_pct: float | None
    positions: dict | None
    watchlist: dict | None

    model_config = {"from_attributes": True}


class PnLPoint(BaseModel):
    fetched_at: datetime
    total_value: Decimal | None
    total_pnl: Decimal | None
    total_pnl_pct: float | None
