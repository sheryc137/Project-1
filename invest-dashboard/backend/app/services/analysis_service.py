from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.claude_client import ClaudeClient
from app.models.ai_analysis import AIAnalysis
from app.models.alert import Alert
from app.models.news_article import NewsArticle
from app.models.portfolio_snapshot import PortfolioSnapshot
from app.utils.keyword_mapper import find_matches
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def run_analysis(
    db: AsyncSession,
    triggered_by: str = "manual",
) -> AIAnalysis:
    # Fetch latest portfolio snapshot
    snap_result = await db.execute(
        select(PortfolioSnapshot).order_by(PortfolioSnapshot.fetched_at.desc()).limit(1)
    )
    snapshot = snap_result.scalar_one_or_none()
    if not snapshot:
        raise ValueError("No portfolio snapshot available. Run a portfolio sync first.")

    portfolio_data = {
        "total_value": float(snapshot.total_value or 0),
        "buying_power": float(snapshot.buying_power or 0),
        "positions": snapshot.positions or [],
    }

    # Fetch recent news
    from app.config import settings
    since = datetime.now(timezone.utc) - timedelta(hours=settings.analysis_news_lookback_hours)
    news_result = await db.execute(
        select(NewsArticle)
        .where(NewsArticle.published_at >= since)
        .order_by(NewsArticle.published_at.desc())
        .limit(settings.analysis_max_articles)
    )
    articles = list(news_result.scalars().all())

    # Build combined text for keyword matching
    combined_text = " ".join([(a.title or "") + " " + (a.body or "") for a in articles])
    keyword_alerts = find_matches(combined_text)

    # Convert articles to dicts for Claude
    article_dicts = [
        {
            "source": a.source,
            "title": a.title,
            "body": a.body,
            "published_at": a.published_at.strftime("%Y-%m-%d %H:%M"),
            "sentiment_score": a.sentiment_score or 0.0,
        }
        for a in articles
    ]

    # Call Claude
    claude = ClaudeClient()
    result = claude.run_investment_analysis(portfolio_data, article_dicts, keyword_alerts)

    # Persist analysis
    analysis = AIAnalysis(
        triggered_by=triggered_by,
        market_risk_level=result.get("market_risk_level"),
        risk_score=result.get("risk_score"),
        summary=result.get("summary"),
        full_reasoning=result.get("full_reasoning"),
        per_position=result.get("per_position"),
        key_themes=result.get("key_themes"),
        top_risks=result.get("top_risks"),
        news_ids_used=[a.id for a in articles],
        portfolio_snapshot_id=snapshot.id,
        tokens_used=result.get("tokens_used"),
        cached_tokens=result.get("cached_tokens"),
    )
    db.add(analysis)

    # Create alert if risk level is HIGH or CRITICAL
    risk_level = result.get("market_risk_level", "LOW")
    if risk_level in ("HIGH", "CRITICAL"):
        alert = Alert(
            alert_type="RISK_LEVEL",
            severity="CRITICAL" if risk_level == "CRITICAL" else "WARNING",
            title=f"Market risk elevated: {risk_level}",
            message=result.get("summary"),
        )
        db.add(alert)

    await db.commit()
    await db.refresh(analysis)
    logger.info(f"Analysis complete: {risk_level} (score={result.get('risk_score')})")
    return analysis


async def get_by_id(db: AsyncSession, analysis_id: str) -> AIAnalysis | None:
    import uuid as _uuid
    try:
        uid = _uuid.UUID(analysis_id)
    except ValueError:
        return None
    result = await db.execute(select(AIAnalysis).where(AIAnalysis.id == uid))
    return result.scalar_one_or_none()


async def get_latest(db: AsyncSession) -> AIAnalysis | None:
    result = await db.execute(
        select(AIAnalysis).order_by(AIAnalysis.created_at.desc()).limit(1)
    )
    return result.scalar_one_or_none()


async def get_analyses(db: AsyncSession, page: int = 1, limit: int = 20) -> tuple[list[AIAnalysis], int]:
    count = await db.execute(select(func.count(AIAnalysis.id)))
    total = count.scalar() or 0
    result = await db.execute(
        select(AIAnalysis).order_by(AIAnalysis.created_at.desc()).offset((page - 1) * limit).limit(limit)
    )
    return list(result.scalars().all()), total


async def get_cost_summary(db: AsyncSession) -> dict:
    result = await db.execute(
        select(
            func.count(AIAnalysis.id).label("total_analyses"),
            func.sum(AIAnalysis.tokens_used).label("total_tokens"),
            func.sum(AIAnalysis.cached_tokens).label("total_cached"),
        )
    )
    row = result.one()
    total_input = int(row.total_tokens or 0)
    total_cached = int(row.total_cached or 0)
    # Rough cost estimate (Sonnet 4.6 pricing)
    # Input: $3/MTok, Cached: $0.30/MTok, assume ~20% output ratio
    output_tokens = int(total_input * 0.2)
    cost = (total_input - total_cached) * 3 / 1_000_000 + total_cached * 0.30 / 1_000_000 + output_tokens * 15 / 1_000_000
    return {
        "total_analyses": row.total_analyses or 0,
        "total_input_tokens": total_input,
        "total_cached_tokens": total_cached,
        "total_output_tokens": output_tokens,
        "estimated_cost_usd": round(cost, 4),
    }
