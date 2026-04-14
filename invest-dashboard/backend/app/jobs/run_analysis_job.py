from datetime import datetime, timezone

from app.database import AsyncSessionLocal
from app.redis_client import get_redis
from app.services.analysis_service import run_analysis
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def run_analysis_job():
    logger.info("=== run_analysis_job started ===")
    try:
        async with AsyncSessionLocal() as db:
            analysis = await run_analysis(db, triggered_by="scheduler")
            logger.info(f"Analysis saved: {analysis.market_risk_level} (score={analysis.risk_score})")

        redis = await get_redis()
        await redis.set("job:run_analysis:last_run", datetime.now(timezone.utc).isoformat())
        await redis.aclose()
    except Exception as e:
        logger.error(f"run_analysis_job failed: {e}")
    logger.info("=== run_analysis_job complete ===")
