import asyncio
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.redis_client import get_redis
from app.schemas.alert import AlertOut, PriceAlertCreate, PriceAlertOut, PriceAlertUpdate
from app.services import alert_service

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertOut])
async def list_alerts(
    is_read: bool | None = None,
    alert_type: str | None = None,
    severity: str | None = None,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    return await alert_service.get_alerts(db, is_read=is_read, alert_type=alert_type, severity=severity, limit=limit)


@router.patch("/{alert_id}/read", response_model=AlertOut)
async def mark_read(alert_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    alert = await alert_service.mark_read(db, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    return alert


@router.patch("/read-all")
async def mark_all_read(db: AsyncSession = Depends(get_db)):
    await alert_service.mark_all_read(db)
    return {"message": "All alerts marked as read"}


@router.delete("/{alert_id}")
async def delete_alert(alert_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    deleted = await alert_service.delete_alert(db, alert_id)
    if not deleted:
        raise HTTPException(404, "Alert not found")
    return {"message": "Deleted"}


@router.get("/price-alerts", response_model=list[PriceAlertOut])
async def list_price_alerts(db: AsyncSession = Depends(get_db)):
    return await alert_service.get_price_alerts(db)


@router.post("/price-alerts", response_model=PriceAlertOut, status_code=201)
async def create_price_alert(data: PriceAlertCreate, db: AsyncSession = Depends(get_db)):
    return await alert_service.create_price_alert(db, data)


@router.patch("/price-alerts/{alert_id}", response_model=PriceAlertOut)
async def update_price_alert(alert_id: uuid.UUID, data: PriceAlertUpdate, db: AsyncSession = Depends(get_db)):
    pa = await alert_service.update_price_alert(db, alert_id, data)
    if not pa:
        raise HTTPException(404, "Price alert not found")
    return pa


@router.delete("/price-alerts/{alert_id}")
async def delete_price_alert(alert_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    deleted = await alert_service.delete_price_alert(db, alert_id)
    if not deleted:
        raise HTTPException(404, "Price alert not found")
    return {"message": "Deleted"}


@router.get("/stream")
async def alert_stream():
    """Server-Sent Events endpoint — pushes 'alert' events when new alerts fire."""
    async def event_generator():
        redis = await get_redis()
        pubsub = redis.pubsub()
        await pubsub.subscribe("alerts:new")
        try:
            yield "data: connected\n\n"
            async for message in pubsub.listen():
                if message["type"] == "message":
                    yield f"data: {message['data'].decode()}\n\n"
                await asyncio.sleep(0.1)
        finally:
            await pubsub.unsubscribe("alerts:new")
            await redis.aclose()

    return StreamingResponse(event_generator(), media_type="text/event-stream")
