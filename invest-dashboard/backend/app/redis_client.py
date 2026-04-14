import redis.asyncio as aioredis

from app.config import settings

_pool: aioredis.ConnectionPool | None = None


def get_pool() -> aioredis.ConnectionPool:
    global _pool
    if _pool is None:
        _pool = aioredis.ConnectionPool.from_url(settings.redis_url, decode_responses=False)
    return _pool


async def get_redis() -> aioredis.Redis:
    return aioredis.Redis(connection_pool=get_pool())
