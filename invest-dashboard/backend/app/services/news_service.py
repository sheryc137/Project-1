from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.news_article import NewsArticle


async def get_articles(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    source: str | None = None,
    ticker: str | None = None,
    topic: str | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    min_sentiment: float | None = None,
) -> tuple[list[NewsArticle], int]:
    query = select(NewsArticle)

    if source:
        query = query.where(NewsArticle.source == source)
    if ticker:
        query = query.where(NewsArticle.tickers.contains([ticker]))
    if topic:
        query = query.where(NewsArticle.topics.contains([topic]))
    if from_date:
        query = query.where(NewsArticle.published_at >= from_date)
    if to_date:
        query = query.where(NewsArticle.published_at <= to_date)
    if min_sentiment is not None:
        query = query.where(NewsArticle.sentiment_score >= min_sentiment)

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar() or 0

    query = query.order_by(NewsArticle.published_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all()), total


async def get_recent_for_analysis(
    db: AsyncSession,
    lookback_hours: int = 6,
    limit: int = 80,
    min_relevance: float = 0.0,
) -> list[NewsArticle]:
    since = datetime.now(timezone.utc) - timedelta(hours=lookback_hours)
    query = (
        select(NewsArticle)
        .where(NewsArticle.published_at >= since)
        .order_by(NewsArticle.published_at.desc())
        .limit(limit)
    )
    if min_relevance > 0:
        query = query.where(NewsArticle.relevance_score >= min_relevance)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_topics(db: AsyncSession) -> list[dict]:
    result = await db.execute(
        select(
            func.unnest(NewsArticle.topics).label("topic"),
            func.count().label("count"),
        ).group_by("topic").order_by(func.count().desc()).limit(50)
    )
    return [{"topic": row.topic, "count": row.count} for row in result.fetchall()]
