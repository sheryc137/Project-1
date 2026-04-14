import uuid
from datetime import datetime

from pydantic import BaseModel


class NewsArticleOut(BaseModel):
    id: uuid.UUID
    source: str
    source_url: str
    title: str
    body: str | None
    author: str | None
    published_at: datetime
    ingested_at: datetime
    sentiment_score: float | None
    relevance_score: float | None
    topics: list[str] | None
    tickers: list[str] | None

    model_config = {"from_attributes": True}
