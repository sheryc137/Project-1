import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class AlertOut(BaseModel):
    id: uuid.UUID
    created_at: datetime
    alert_type: str | None
    severity: str | None
    title: str | None
    message: str | None
    ticker: str | None
    is_read: bool

    model_config = {"from_attributes": True}


class PriceAlertOut(BaseModel):
    id: uuid.UUID
    ticker: str
    alert_type: str
    threshold: Decimal
    is_active: bool
    created_at: datetime
    triggered_at: datetime | None
    message: str | None

    model_config = {"from_attributes": True}


class PriceAlertCreate(BaseModel):
    ticker: str
    alert_type: str  # above|below|pct_change
    threshold: Decimal
    message: str | None = None


class PriceAlertUpdate(BaseModel):
    threshold: Decimal | None = None
    alert_type: str | None = None
    is_active: bool | None = None
    message: str | None = None
