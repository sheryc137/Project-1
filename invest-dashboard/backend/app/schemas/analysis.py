import uuid
from datetime import datetime

from pydantic import BaseModel


class AIAnalysisOut(BaseModel):
    id: uuid.UUID
    created_at: datetime
    triggered_by: str | None
    market_risk_level: str | None
    risk_score: int | None
    summary: str | None
    full_reasoning: str | None
    per_position: dict | None
    key_themes: list[str] | None
    top_risks: list[str] | None
    tokens_used: int | None
    cached_tokens: int | None

    model_config = {"from_attributes": True}


class CostSummary(BaseModel):
    total_analyses: int
    total_input_tokens: int
    total_cached_tokens: int
    total_output_tokens: int
    estimated_cost_usd: float
