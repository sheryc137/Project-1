from datetime import datetime, timezone
from decimal import Decimal

from app.database import AsyncSessionLocal
from app.models.portfolio_snapshot import PortfolioSnapshot
from app.redis_client import get_redis
from app.integrations.robinhood import RobinhoodIntegration
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def sync_portfolio_job():
    logger.info("=== sync_portfolio_job started ===")
    redis = await get_redis()
    try:
        rh = RobinhoodIntegration(redis)
        data = await rh.get_portfolio()

        async with AsyncSessionLocal() as db:
            snapshot = PortfolioSnapshot(
                total_value=Decimal(str(data.get("total_value", 0))),
                buying_power=Decimal(str(data.get("buying_power", 0))),
                total_pnl=Decimal(str(data.get("total_pnl", 0))),
                positions=data.get("positions"),
                watchlist=data.get("watchlist"),
            )
            db.add(snapshot)
            await db.commit()
            logger.info(f"Portfolio snapshot saved: ${data.get('total_value', 0):,.2f}")

        await redis.set("job:sync_portfolio:last_run", datetime.now(timezone.utc).isoformat())
    except Exception as e:
        logger.error(f"sync_portfolio_job failed: {e}")
    finally:
        await redis.aclose()
    logger.info("=== sync_portfolio_job complete ===")
