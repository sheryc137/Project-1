from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.portfolio_snapshot import PortfolioSnapshot
from app.schemas.portfolio import PnLPoint


async def get_current(db: AsyncSession) -> PortfolioSnapshot | None:
    result = await db.execute(
        select(PortfolioSnapshot).order_by(PortfolioSnapshot.fetched_at.desc()).limit(1)
    )
    return result.scalar_one_or_none()


async def get_snapshots(db: AsyncSession, limit: int = 50) -> list[PortfolioSnapshot]:
    result = await db.execute(
        select(PortfolioSnapshot).order_by(PortfolioSnapshot.fetched_at.desc()).limit(limit)
    )
    return list(result.scalars().all())


async def get_pnl_history(db: AsyncSession, period: str = "7d") -> list[PnLPoint]:
    days_map = {"7d": 7, "30d": 30, "90d": 90}
    days = days_map.get(period, 7)
    since = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(PortfolioSnapshot)
        .where(PortfolioSnapshot.fetched_at >= since)
        .order_by(PortfolioSnapshot.fetched_at.asc())
    )
    snapshots = result.scalars().all()
    return [
        PnLPoint(
            fetched_at=s.fetched_at,
            total_value=s.total_value,
            total_pnl=s.total_pnl,
            total_pnl_pct=s.total_pnl_pct,
        )
        for s in snapshots
    ]
