from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173"

    # Database
    database_url: str = "postgresql+asyncpg://invest_user:password@localhost:5432/invest_dashboard"

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_jobs_db: int = 1

    # Anthropic
    anthropic_api_key: str = ""

    # Robinhood
    robinhood_username: str = ""
    robinhood_password: str = ""
    robinhood_mfa_secret: str = ""  # base32 TOTP secret from QR code

    # NewsAPI
    newsapi_key: str = ""

    # Reddit (PRAW)
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "invest-dashboard/1.0"

    # GDELT
    gdelt_base_url: str = "https://api.gdeltproject.org/api/v2/doc/doc"

    # Job schedules
    job_scrape_news_interval_minutes: int = 30
    job_run_analysis_interval_hours: int = 4
    job_sync_portfolio_interval_minutes: int = 15
    job_check_alerts_interval_minutes: int = 5

    # Analysis tuning
    analysis_news_lookback_hours: int = 6
    analysis_max_articles: int = 80
    analysis_news_min_relevance: float = 0.2

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
