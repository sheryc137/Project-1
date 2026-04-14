import hashlib
from datetime import timedelta

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.news_article import NewsArticle
from app.utils.logger import get_logger

logger = get_logger(__name__)

REDIS_KEY = "scraper:seen_urls"
TTL_SECONDS = 30 * 24 * 3600  # 30 days


def _url_hash(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()


async def filter_new(
    articles: list[dict],
    redis: aioredis.Redis,
    db: AsyncSession,
) -> list[dict]:
    """Return only articles whose source_url has not been seen before."""
    if not articles:
        return []

    # Batch check Redis first (fast path)
    hashes = [_url_hash(a["source_url"]) for a in articles if a.get("source_url")]
    pipe = redis.pipeline()
    for h in hashes:
        pipe.sismember(REDIS_KEY, h)
    results = await pipe.execute()

    new_articles = []
    new_hashes = []
    for art, seen in zip(articles, results):
        if not seen and art.get("source_url"):
            new_articles.append(art)
            new_hashes.append(_url_hash(art["source_url"]))

    # DB fallback: check for any URL already in the DB
    if new_articles:
        urls = [a["source_url"] for a in new_articles]
        result = await db.execute(
            select(NewsArticle.source_url).where(NewsArticle.source_url.in_(urls))
        )
        existing_urls = {row[0] for row in result.fetchall()}
        new_articles = [a for a in new_articles if a["source_url"] not in existing_urls]

    # Store new hashes in Redis
    if new_hashes:
        pipe = redis.pipeline()
        for h in new_hashes:
            pipe.sadd(REDIS_KEY, h)
        pipe.expire(REDIS_KEY, TTL_SECONDS)
        await pipe.execute()

    logger.info(f"Deduplicator: {len(articles)} in → {len(new_articles)} new")
    return new_articles
