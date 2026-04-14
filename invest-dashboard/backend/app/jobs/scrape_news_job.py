import asyncio
from datetime import datetime, timezone

from sqlalchemy import insert

from app.database import AsyncSessionLocal
from app.models.news_article import NewsArticle
from app.redis_client import get_redis
from app.scrapers.deduplicator import filter_new
from app.scrapers.gdelt_scraper import GDELTScraper
from app.scrapers.newsapi_scraper import NewsAPIScraper
from app.scrapers.reddit_scraper import RedditScraper
from app.scrapers.rss_scraper import RSSScraper
from app.utils.keyword_mapper import get_affected_tickers, find_matches
from app.utils.logger import get_logger
from app.utils.sentiment import score_text

logger = get_logger(__name__)


async def scrape_news_job():
    logger.info("=== scrape_news_job started ===")
    scrapers = [RSSScraper(), NewsAPIScraper(), RedditScraper(), GDELTScraper()]

    # Run all scrapers in parallel
    results = await asyncio.gather(*[s.scrape() for s in scrapers], return_exceptions=True)
    all_articles: list[dict] = []
    for r in results:
        if isinstance(r, Exception):
            logger.warning(f"Scraper error: {r}")
        else:
            all_articles.extend(r)

    logger.info(f"Total scraped: {len(all_articles)} articles")

    async with AsyncSessionLocal() as db:
        redis = await get_redis()
        new_articles = await filter_new(all_articles, redis, db)
        await redis.aclose()

        if not new_articles:
            logger.info("No new articles to insert")
            return

        # Enrich with sentiment and keyword matches
        rows = []
        for art in new_articles:
            text = f"{art.get('title', '')} {art.get('body', '')}"
            sentiment = score_text(text)
            tickers = get_affected_tickers(text)
            matches = find_matches(text)
            topics = list({m["sector"] for m in matches})

            rows.append({
                "source": art.get("source", "unknown"),
                "source_url": art["source_url"],
                "title": art.get("title", ""),
                "body": art.get("body"),
                "author": art.get("author"),
                "published_at": art.get("published_at", datetime.now(timezone.utc)),
                "sentiment_score": sentiment,
                "relevance_score": min(1.0, len(tickers) * 0.1 + abs(sentiment) * 0.5),
                "topics": topics or None,
                "tickers": tickers or None,
                "is_processed": False,
            })

        # Bulk insert, ignore duplicates
        if rows:
            stmt = insert(NewsArticle).values(rows).on_conflict_do_nothing(index_elements=["source_url"])
            await db.execute(stmt)
            await db.commit()
            logger.info(f"Inserted {len(rows)} new articles")

    # Update last-run status in Redis
    redis = await get_redis()
    await redis.set("job:scrape_news:last_run", datetime.now(timezone.utc).isoformat())
    await redis.set("job:scrape_news:last_count", str(len(rows)))
    await redis.aclose()
    logger.info("=== scrape_news_job complete ===")
