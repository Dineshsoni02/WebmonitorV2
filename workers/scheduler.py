"""
Main scheduler entry point for Python background workers.
Runs scheduled jobs for health checks, SSL validation, SEO analysis, and cleanup.

Usage:
    python scheduler.py
"""

import logging
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.events import EVENT_JOB_ERROR, EVENT_JOB_EXECUTED

from config import (
    HEALTH_CHECK_HOUR,
    HEALTH_CHECK_MINUTE,
    CLEANUP_HOUR,
    CLEANUP_MINUTE,
)
from workers.health_check import run_health_checks
from workers.ssl_validator import run_ssl_checks
from workers.seo_analyzer import run_seo_analysis
from workers.cleanup import run_cleanup

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def job_listener(event):
    """Log job execution events."""
    if event.exception:
        logger.error(f"Job {event.job_id} failed: {event.exception}")
    else:
        logger.info(f"Job {event.job_id} completed successfully")


def main():
    """Initialize and start the scheduler."""
    scheduler = BlockingScheduler()

    # Add job execution listener
    scheduler.add_listener(job_listener, EVENT_JOB_ERROR | EVENT_JOB_EXECUTED)

    # Daily website health checks at configured time (default 9:00 AM)
    scheduler.add_job(
        run_health_checks,
        "cron",
        hour=HEALTH_CHECK_HOUR,
        minute=HEALTH_CHECK_MINUTE,
        id="health_checks",
        name="Website Health Checks",
    )

    # SSL checks 5 minutes after health checks
    scheduler.add_job(
        run_ssl_checks,
        "cron",
        hour=HEALTH_CHECK_HOUR,
        minute=(HEALTH_CHECK_MINUTE + 5) % 60,
        id="ssl_checks",
        name="SSL Certificate Validation",
    )

    # SEO analysis 10 minutes after health checks
    scheduler.add_job(
        run_seo_analysis,
        "cron",
        hour=HEALTH_CHECK_HOUR,
        minute=(HEALTH_CHECK_MINUTE + 10) % 60,
        id="seo_analysis",
        name="SEO Metadata Analysis",
    )

    # Midnight cleanup
    scheduler.add_job(
        run_cleanup,
        "cron",
        hour=CLEANUP_HOUR,
        minute=CLEANUP_MINUTE,
        id="cleanup",
        name="Expired Token Cleanup",
    )

    logger.info("🚀 Python Worker Scheduler starting...")
    logger.info(
        f"📅 Health checks scheduled at {HEALTH_CHECK_HOUR:02d}:{HEALTH_CHECK_MINUTE:02d}"
    )
    logger.info(f"🧹 Cleanup scheduled at {CLEANUP_HOUR:02d}:{CLEANUP_MINUTE:02d}")

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped")


if __name__ == "__main__":
    main()
