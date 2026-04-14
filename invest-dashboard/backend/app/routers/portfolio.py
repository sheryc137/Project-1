from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.jobs.sync_portfolio_job import sync_portfolio_job
from app.redis_client import get_redis
from app.schemas.portfolio import PnLPoint, PortfolioSnapshotOut
from app.services import portfolio_service

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/current", response_model=PortfolioSnapshotOut)
async def get_current(db: AsyncSession = Depends(get_db)):
    snapshot = await portfolio_service.get_current(db)
    if not snapshot:
        raise HTTPException(404, "No portfolio data yet. Run a sync first.")
    return snapshot


@router.get("/snapshots", response_model=list[PortfolioSnapshotOut])
async def get_snapshots(limit: int = Query(50, le=200), db: AsyncSession = Depends(get_db)):
    return await portfolio_service.get_snapshots(db, limit=limit)


@router.post("/sync")
async def sync_portfolio(background_tasks: BackgroundTasks):
    background_tasks.add_task(sync_portfolio_job)
    return {"message": "Portfolio sync triggered"}


@router.get("/pnl/history", response_model=list[PnLPoint])
async def pnl_history(period: str = Query("7d", pattern="^(7d|30d|90d)$"), db: AsyncSession = Depends(get_db)):
    return await portfolio_service.get_pnl_history(db, period=period)
