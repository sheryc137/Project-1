import asyncio
from functools import lru_cache

from app.utils.logger import get_logger

logger = get_logger(__name__)


async def get_price(ticker: str) -> float | None:
    """Fetch current price for a ticker via yfinance (runs in thread to avoid blocking)."""
    try:
        import yfinance as yf
        loop = asyncio.get_event_loop()
        price = await loop.run_in_executor(None, _fetch_price, ticker)
        return price
    except Exception as e:
        logger.warning(f"yfinance price fetch failed for {ticker}: {e}")
        return None


def _fetch_price(ticker: str) -> float | None:
    import yfinance as yf
    info = yf.Ticker(ticker).fast_info
    return float(info.last_price) if info.last_price else None


async def get_prices_bulk(tickers: list[str]) -> dict[str, float | None]:
    """Fetch prices for multiple tickers concurrently."""
    results = await asyncio.gather(*[get_price(t) for t in tickers], return_exceptions=True)
    return {
        ticker: (None if isinstance(r, Exception) else r)
        for ticker, r in zip(tickers, results)
    }
