from abc import ABC, abstractmethod
from datetime import datetime


class BaseScraper(ABC):
    source_name: str = "unknown"

    @abstractmethod
    async def scrape(self) -> list[dict]:
        """Return list of raw article dicts with keys:
        source, source_url, title, body, author, published_at (datetime)
        """

    @staticmethod
    def _safe_date(value) -> datetime:
        if isinstance(value, datetime):
            return value
        try:
            from email.utils import parsedate_to_datetime
            return parsedate_to_datetime(str(value))
        except Exception:
            return datetime.utcnow()
