from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.price_alert import PriceAlert
from app.schemas.alert import PriceAlertCreate, PriceAlertUpdate


async def get_alerts(
    db: AsyncSession,
    is_read: bool | None = None,
    alert_type: str | None = None,
    severity: str | None = None,
    limit: int = 50,
) -> list[Alert]:
    query = select(Alert).order_by(Alert.created_at.desc()).limit(limit)
    if is_read is not None:
        query = query.where(Alert.is_read == is_read)
    if alert_type:
        query = query.where(Alert.alert_type == alert_type)
    if severity:
        query = query.where(Alert.severity == severity)
    result = await db.execute(query)
    return list(result.scalars().all())


async def mark_read(db: AsyncSession, alert_id) -> Alert | None:
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if alert:
        alert.is_read = True
        await db.commit()
    return alert


async def mark_all_read(db: AsyncSession):
    await db.execute(update(Alert).where(Alert.is_read == False).values(is_read=True))
    await db.commit()


async def delete_alert(db: AsyncSession, alert_id) -> bool:
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if alert:
        await db.delete(alert)
        await db.commit()
        return True
    return False


async def get_price_alerts(db: AsyncSession) -> list[PriceAlert]:
    result = await db.execute(select(PriceAlert).order_by(PriceAlert.created_at.desc()))
    return list(result.scalars().all())


async def create_price_alert(db: AsyncSession, data: PriceAlertCreate) -> PriceAlert:
    pa = PriceAlert(ticker=data.ticker.upper(), alert_type=data.alert_type, threshold=data.threshold, message=data.message)
    db.add(pa)
    await db.commit()
    await db.refresh(pa)
    return pa


async def update_price_alert(db: AsyncSession, alert_id, data: PriceAlertUpdate) -> PriceAlert | None:
    result = await db.execute(select(PriceAlert).where(PriceAlert.id == alert_id))
    pa = result.scalar_one_or_none()
    if not pa:
        return None
    for field, val in data.model_dump(exclude_none=True).items():
        setattr(pa, field, val)
    await db.commit()
    await db.refresh(pa)
    return pa


async def delete_price_alert(db: AsyncSession, alert_id) -> bool:
    result = await db.execute(select(PriceAlert).where(PriceAlert.id == alert_id))
    pa = result.scalar_one_or_none()
    if pa:
        await db.delete(pa)
        await db.commit()
        return True
    return False
