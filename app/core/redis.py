import redis
from app.core.config import settings

redis_client = redis.Redis.from_url(
    settings.REDIS_URL,
    decode_responses=True  
)

def invalidate_product_cache():
    for key in redis_client.scan_iter("products:*"):
        redis_client.delete(key)

CACHE_TTL = 60  
