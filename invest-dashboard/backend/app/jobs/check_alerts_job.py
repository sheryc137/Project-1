from datetime import datetime, timezone

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.integrations.yfinance_client import get_prices_bulk
from app.models.alert import Alert
from app.models.price_alert import PriceAlert
from app.redis_client import get_redis
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def check_alerts_job():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(PriceAlert).where(PriceAlert.is_active == True, PriceAlert.triggered_at.is_(None))
        )
        active_alerts = list(result.scalars().all())

        if not active_alerts:
            return

        tickers = list({a.ticker for a in active_alerts})
        prices = await get_prices_bulk(tickers)

        triggered = 0
        for pa in active_alerts:
            current_price = prices.get(pa.ticker)
            if current_price is None:
                continue

            threshold = float(pa.threshold)
            fired = False
            msg = ""

            if pa.alert_type == "above" and current_price >= threshold:
                fired = True
                msg = f"{pa.ticker} hit ${current_price:.2f} (above ${threshold:.2f})"
            elif pa.alert_type == "below" and current_price <= threshold:
                fired = True
                msg = f"{pa.ticker} hit ${current_price:.2f} (below ${threshold:.2f})"
            elif pa.alert_type == "pct_change":
                # Would need a reference price — use threshold as % directly for simplicity
                fired = abs(current_price) >= threshold
                msg = f"{pa.ticker} moved {current_price:+.2f}%"

            if fired:
                pa.triggered_at = datetime.now(timezone.utc)
                pa.is_active = False

                alert = Alert(
                    alert_type="PRICE_ALERT",
                    severity="WARNING",
                    title=f"Price alert: {pa.ticker}",
                    message=pa.message or msg,
                    ticker=pa.ticker,
                    metadata_={"price": current_price, "threshold": threshold, "alert_type": pa.alert_type},
                )
                db.add(alert)
                triggered += 1

        if triggered:
            await db.commit()
            logger.info(f"check_alerts_job: {triggered} price alert(s) fired")

            # Notify via Redis pub/sub for SSE
            redis = await get_redis()
            await redis.publish("alerts:new", str(triggered))
            await redis.aclose()
