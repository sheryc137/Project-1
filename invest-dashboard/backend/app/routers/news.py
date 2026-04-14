import asyncio
import math
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.jobs.scrape_news_job import scrape_news_job
from app.schemas.news import NewsArticleOut
from app.services import news_service

router = APIRouter(prefix="/news", tags=["news"])


@router.get("", response_model=dict)
async def list_news(
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    source: str | None = None,
    ticker: str | None = None,
    topic: str | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    min_sentiment: float | None = None,
    db: AsyncSession = Depends(get_db),
):
    articles, total = await news_service.get_articles(
        db, page=page, limit=limit, source=source, ticker=ticker,
        topic=topic, from_date=from_date, to_date=to_date, min_sentiment=min_sentiment,
    )
    return {
        "items": [NewsArticleOut.model_validate(a) for a in articles],
        "total": total, "page": page, "limit": limit,
        "pages": math.ceil(total / limit) if limit else 1,
    }


@router.post("/ingest/trigger")
async def trigger_ingest(background_tasks: BackgroundTasks):
    background_tasks.add_task(scrape_news_job)
    return {"message": "Scrape job triggered"}


@router.get("/topics")
async def get_topics(db: AsyncSession = Depends(get_db)):
    return await news_service.get_topics(db)
