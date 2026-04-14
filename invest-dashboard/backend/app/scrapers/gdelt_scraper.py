from datetime import datetime, timezone

import httpx

from app.config import settings
from app.scrapers.base_scraper import BaseScraper
from app.utils.logger import get_logger

logger = get_logger(__name__)

GDELT_THEMES = [
    "TAX_FNCACT_GEOPOLITICS",
    "MILITARY",
    "SANCTIONS",
    "WB_2009_ECONOMIC_CRISIS",
    "ECON_STOCKMARKET",
    "ECON_INTEREST_RATE",
]


class GDELTScraper(BaseScraper):
    source_name = "gdelt"

    async def scrape(self) -> list[dict]:
        articles = []
        async with httpx.AsyncClient(timeout=20) as client:
            for theme in GDELT_THEMES[:3]:  # limit to avoid rate issues
                try:
                    resp = await client.get(
                        settings.gdelt_base_url,
                        params={
                            "query": f"theme:{theme}",
                            "mode": "artlist",
                            "maxrecords": 25,
                            "format": "json",
                            "sort": "DateDesc",
                        },
                    )
                    if resp.status_code != 200:
                        continue
                    data = resp.json()
                    for art in data.get("articles", []):
                        articles.append({
                            "source": "gdelt",
                            "source_url": art.get("url", ""),
                            "title": art.get("title", ""),
                            "body": art.get("seendate", ""),
                            "author": art.get("domain"),
                            "published_at": self._parse_gdelt_date(art.get("seendate", "")),
                        })
                except Exception as e:
                    logger.warning(f"GDELT theme {theme} failed: {e}")

        logger.info(f"GDELT scraped {len(articles)} articles")
        return articles

    def _parse_gdelt_date(self, date_str: str) -> datetime:
        try:
            # GDELT format: 20240101T120000Z
            return datetime.strptime(date_str, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)
        except Exception:
            return datetime.now(timezone.utc)
