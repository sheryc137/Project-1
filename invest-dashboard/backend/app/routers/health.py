from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.redis_client import get_redis

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health(db: AsyncSession = Depends(get_db)):
    status = {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

    # DB check
    try:
        await db.execute(__import__("sqlalchemy").text("SELECT 1"))
        status["db"] = "ok"
    except Exception as e:
        status["db"] = f"error: {e}"

    # Redis check
    try:
        r = await get_redis()
        await r.ping()
        await r.aclose()
        status["redis"] = "ok"
    except Exception as e:
        status["redis"] = f"error: {e}"

    return status


@router.get("/jobs")
async def job_status():
    redis = await get_redis()
    try:
        jobs = {}
        for job_id in ["scrape_news", "run_analysis", "sync_portfolio", "check_alerts"]:
            last_run = await redis.get(f"job:{job_id}:last_run")
            jobs[job_id] = {"last_run": last_run.decode() if last_run else None}
        return jobs
    finally:
        await redis.aclose()
