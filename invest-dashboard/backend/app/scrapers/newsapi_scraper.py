from datetime import datetime, timedelta, timezone

import httpx

from app.config import settings
from app.scrapers.base_scraper import BaseScraper
from app.utils.logger import get_logger

logger = get_logger(__name__)

QUERIES = [
    "geopolitical tensions",
    "global conflict sanctions",
    "central bank interest rates",
    "stock market crash recession",
    "oil energy prices OPEC",
    "semiconductor chip supply chain",
    "China Taiwan trade war",
]


class NewsAPIScraper(BaseScraper):
    source_name = "newsapi"

    async def scrape(self) -> list[dict]:
        if not settings.newsapi_key:
            logger.warning("NEWSAPI_KEY not set — skipping NewsAPI scraper")
            return []

        articles = []
        from_date = (datetime.now(timezone.utc) - timedelta(hours=settings.analysis_news_lookback_hours * 2)).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        )

        async with httpx.AsyncClient(timeout=15) as client:
            for query in QUERIES:
                try:
                    resp = await client.get(
                        "https://newsapi.org/v2/everything",
                        params={
                            "q": query,
                            "from": from_date,
                            "sortBy": "publishedAt",
                            "pageSize": 20,
                            "language": "en",
                            "apiKey": settings.newsapi_key,
                        },
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    for art in data.get("articles", []):
                        if not art.get("url"):
                            continue
                        articles.append({
                            "source": "newsapi",
                            "source_url": art["url"],
                            "title": art.get("title", ""),
                            "body": art.get("description") or art.get("content", ""),
                            "author": art.get("author"),
                            "published_at": datetime.fromisoformat(
                                art["publishedAt"].replace("Z", "+00:00")
                            ) if art.get("publishedAt") else datetime.now(timezone.utc),
                        })
                except Exception as e:
                    logger.warning(f"NewsAPI query '{query}' failed: {e}")

        logger.info(f"NewsAPI scraped {len(articles)} articles")
        return articles
