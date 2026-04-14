"""
Robinhood integration via robin_stocks (unofficial API).
Session state is pickled and stored in Redis to avoid re-authenticating on every run.
"""
import json
import pickle
from datetime import datetime, timezone

import pyotp
import redis.asyncio as aioredis

from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

SESSION_REDIS_KEY = "robinhood:session"
SESSION_TTL = 60 * 60 * 20  # 20 hours (Robinhood OAuth token lifetime)
CACHE_KEY = "portfolio:current"
CACHE_TTL = 60 * 10  # 10 minutes


class RobinhoodIntegration:
    def __init__(self, redis_client: aioredis.Redis):
        self._redis = redis_client
        self._logged_in = False

    async def login(self) -> bool:
        """Restore session from Redis or perform fresh login with TOTP MFA."""
        try:
            import robin_stocks.robinhood as rh
        except ImportError:
            logger.error("robin_stocks not installed")
            return False

        # Try restoring cached session
        cached = await self._redis.get(SESSION_REDIS_KEY)
        if cached:
            try:
                session_data = pickle.loads(cached)
                # robin_stocks stores login state in its own module-level dict
                rh.helper.set_login_state(True)
                rh.helper.update_session("Authorization", f"Bearer {session_data.get('access_token', '')}")
                # Quick verification
                profile = rh.profiles.load_account_profile()
                if profile and profile.get("url"):
                    self._logged_in = True
                    logger.info("Robinhood: restored session from Redis cache")
                    return True
            except Exception as e:
                logger.warning(f"Robinhood: cached session invalid ({e}), re-authenticating")

        # Fresh login
        if not settings.robinhood_username or not settings.robinhood_password:
            logger.error("Robinhood credentials not configured in .env")
            return False

        try:
            mfa_code = None
            if settings.robinhood_mfa_secret:
                mfa_code = pyotp.TOTP(settings.robinhood_mfa_secret).now()

            login_result = rh.login(
                username=settings.robinhood_username,
                password=settings.robinhood_password,
                mfa_code=mfa_code,
                store_session=False,
            )
            if login_result:
                # Persist the access token
                token_data = {"access_token": login_result.get("access_token", "")}
                await self._redis.setex(SESSION_REDIS_KEY, SESSION_TTL, pickle.dumps(token_data))
                self._logged_in = True
                logger.info("Robinhood: fresh login successful")
                return True
        except Exception as e:
            logger.error(f"Robinhood login failed: {e}")

        return False

    async def get_portfolio(self) -> dict:
        """Fetch and normalize portfolio data from Robinhood."""
        await self._ensure_logged_in()

        try:
            import robin_stocks.robinhood as rh

            holdings = rh.account.build_holdings() or {}
            portfolio_profile = rh.profiles.load_portfolio_profile() or {}
            account_profile = rh.profiles.load_account_profile() or {}

            positions = []
            for ticker, data in holdings.items():
                positions.append({
                    "ticker": ticker,
                    "name": data.get("name", ticker),
                    "quantity": float(data.get("quantity", 0)),
                    "avg_buy_price": float(data.get("average_buy_price", 0)),
                    "current_price": float(data.get("price", 0)),
                    "equity": float(data.get("equity", 0)),
                    "percent_change": float(data.get("percent_change", 0)),
                    "equity_change": float(data.get("equity_change", 0)),
                    "pe_ratio": data.get("pe_ratio"),
                })

            result = {
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "total_value": float(portfolio_profile.get("equity", 0) or 0),
                "buying_power": float(account_profile.get("buying_power", 0) or 0),
                "total_pnl": float(portfolio_profile.get("extended_hours_equity", 0) or 0)
                             - float(portfolio_profile.get("equity", 0) or 0),
                "positions": positions,
                "watchlist": [],
            }

            # Cache in Redis
            await self._redis.setex(CACHE_KEY, CACHE_TTL, json.dumps(result))
            return result

        except Exception as e:
            logger.error(f"Robinhood get_portfolio failed: {e}")
            # Return cached data if available
            cached = await self._redis.get(CACHE_KEY)
            if cached:
                return json.loads(cached)
            raise

    async def get_cached_portfolio(self) -> dict | None:
        cached = await self._redis.get(CACHE_KEY)
        return json.loads(cached) if cached else None

    async def _ensure_logged_in(self):
        if not self._logged_in:
            success = await self.login()
            if not success:
                raise RuntimeError("Robinhood authentication failed. Check credentials in .env")
