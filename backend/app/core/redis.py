import redis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Try to connect to Redis with minimal timeout
try:
    redis_client = redis.Redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        socket_connect_timeout=1,  # Very short timeout
        socket_timeout=1,
        retry_on_timeout=False
    )
    # Test connection with ping
    redis_client.ping()
    REDIS_AVAILABLE = True
    logger.info("✓ Redis connected successfully")
except Exception as e:
    logger.warning(f"⚠ Redis not available: {str(e)[:50]}. Running without caching.")
    redis_client = None
    REDIS_AVAILABLE = False

def invalidate_product_cache():
    """Clear product cache from Redis if available"""
    if not REDIS_AVAILABLE or not redis_client:
        return
    
    try:
        for key in redis_client.scan_iter("products:*"):
            redis_client.delete(key)
    except Exception as e:
        logger.warning(f"Failed to invalidate cache: {e}")

CACHE_TTL = 60
