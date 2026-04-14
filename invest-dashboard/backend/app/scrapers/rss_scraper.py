from datetime import datetime, timezone

import feedparser

from app.scrapers.base_scraper import BaseScraper
from app.utils.logger import get_logger

logger = get_logger(__name__)

RSS_FEEDS = [
    ("reuters",  "https://feeds.reuters.com/reuters/businessNews"),
    ("reuters",  "https://feeds.reuters.com/Reuters/worldNews"),
    ("ft",       "https://www.ft.com/rss/home"),
    ("nyt",      "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml"),
    ("nyt",      "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"),
    ("wsj",      "https://feeds.a.dj.com/rss/RSSMarketsMain.xml"),
    ("investing","https://www.investing.com/rss/news.rss"),
]


class RSSScraper(BaseScraper):
    source_name = "rss"

    async def scrape(self) -> list[dict]:
        articles = []
        for feed_source, url in RSS_FEEDS:
            try:
                feed = feedparser.parse(url)
                for entry in feed.entries[:30]:
                    published_at = self._parse_published(entry)
                    articles.append({
                        "source": feed_source,
                        "source_url": entry.get("link", ""),
                        "title": entry.get("title", ""),
                        "body": entry.get("summary", entry.get("description", "")),
                        "author": entry.get("author"),
                        "published_at": published_at,
                    })
            except Exception as e:
                logger.warning(f"RSS scrape failed for {url}: {e}")
        logger.info(f"RSS scraped {len(articles)} articles")
        return articles

    def _parse_published(self, entry) -> datetime:
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            import time
            return datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
        return datetime.now(timezone.utc)
