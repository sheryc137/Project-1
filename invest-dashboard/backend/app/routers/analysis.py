import math
import time

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.jobs.run_analysis_job import run_analysis_job
from app.redis_client import get_redis
from app.schemas.analysis import AIAnalysisOut, CostSummary
from app.services import analysis_service

router = APIRouter(prefix="/analysis", tags=["analysis"])

_RATE_LIMIT_KEY = "rate_limit:analysis_run"
_RATE_LIMIT_MAX = 5
_RATE_LIMIT_WINDOW = 3600  # 1 hour


async def _check_rate_limit():
    """Sliding-window counter rate limit using Redis: max 5 calls per hour."""
    redis = await get_redis()
    now = int(time.time())
    window_start = now - _RATE_LIMIT_WINDOW

    pipe = redis.pipeline()
    pipe.zremrangebyscore(_RATE_LIMIT_KEY, 0, window_start)
    pipe.zadd(_RATE_LIMIT_KEY, {str(now): now})
    pipe.zcard(_RATE_LIMIT_KEY)
    pipe.expire(_RATE_LIMIT_KEY, _RATE_LIMIT_WINDOW)
    results = await pipe.execute()

    count = results[2]
    if count > _RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded: max {_RATE_LIMIT_MAX} analysis runs per hour.",
        )


@router.get("", response_model=dict)
async def list_analyses(
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    analyses, total = await analysis_service.get_analyses(db, page=page, limit=limit)
    return {
        "items": [AIAnalysisOut.model_validate(a) for a in analyses],
        "total": total, "page": page, "limit": limit,
        "pages": math.ceil(total / limit) if limit else 1,
    }


@router.get("/latest", response_model=AIAnalysisOut | None)
async def get_latest(db: AsyncSession = Depends(get_db)):
    return await analysis_service.get_latest(db)


@router.get("/cost", response_model=CostSummary)
async def get_cost(db: AsyncSession = Depends(get_db)):
    return await analysis_service.get_cost_summary(db)


@router.post("/run")
async def run_analysis(background_tasks: BackgroundTasks):
    await _check_rate_limit()
    background_tasks.add_task(run_analysis_job)
    return {"message": "Analysis job triggered"}


@router.get("/{analysis_id}", response_model=AIAnalysisOut)
async def get_analysis(analysis_id: str, db: AsyncSession = Depends(get_db)):
    result = await analysis_service.get_by_id(db, analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result
