from datetime import datetime, timezone

import praw

from app.config import settings
from app.scrapers.base_scraper import BaseScraper
from app.utils.logger import get_logger

logger = get_logger(__name__)

SUBREDDITS = ["worldnews", "geopolitics", "investing", "stocks", "economics", "wallstreetbets"]


class RedditScraper(BaseScraper):
    source_name = "reddit"

    async def scrape(self) -> list[dict]:
        if not settings.reddit_client_id:
            logger.warning("REDDIT_CLIENT_ID not set — skipping Reddit scraper")
            return []

        articles = []
        try:
            reddit = praw.Reddit(
                client_id=settings.reddit_client_id,
                client_secret=settings.reddit_client_secret,
                user_agent=settings.reddit_user_agent,
            )
            for subreddit_name in SUBREDDITS:
                try:
                    subreddit = reddit.subreddit(subreddit_name)
                    for post in subreddit.hot(limit=20):
                        articles.append({
                            "source": "reddit",
                            "source_url": f"https://reddit.com{post.permalink}",
                            "title": post.title,
                            "body": post.selftext[:1000] if post.selftext else "",
                            "author": str(post.author) if post.author else None,
                            "published_at": datetime.fromtimestamp(post.created_utc, tz=timezone.utc),
                        })
                except Exception as e:
                    logger.warning(f"Reddit r/{subreddit_name} failed: {e}")
        except Exception as e:
            logger.warning(f"Reddit init failed: {e}")

        logger.info(f"Reddit scraped {len(articles)} posts")
        return articles
