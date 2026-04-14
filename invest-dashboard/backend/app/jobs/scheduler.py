from apscheduler.executors.asyncio import AsyncIOExecutor
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings
from app.jobs.check_alerts_job import check_alerts_job
from app.jobs.run_analysis_job import run_analysis_job
from app.jobs.scrape_news_job import scrape_news_job
from app.jobs.sync_portfolio_job import sync_portfolio_job
from app.utils.logger import get_logger

logger = get_logger(__name__)


def create_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(executors={"default": AsyncIOExecutor()})

    scheduler.add_job(
        scrape_news_job, "interval",
        minutes=settings.job_scrape_news_interval_minutes,
        id="scrape_news", replace_existing=True, coalesce=True, max_instances=1,
    )
    scheduler.add_job(
        run_analysis_job, "interval",
        hours=settings.job_run_analysis_interval_hours,
        id="run_analysis", replace_existing=True, coalesce=True, max_instances=1,
    )
    scheduler.add_job(
        sync_portfolio_job, "interval",
        minutes=settings.job_sync_portfolio_interval_minutes,
        id="sync_portfolio", replace_existing=True, coalesce=True, max_instances=1,
    )
    scheduler.add_job(
        check_alerts_job, "interval",
        minutes=settings.job_check_alerts_interval_minutes,
        id="check_alerts", replace_existing=True, coalesce=True, max_instances=1,
    )

    logger.info("Scheduler configured with 4 jobs")
    return scheduler
