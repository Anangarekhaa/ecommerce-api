from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.redis import redis_client
from app.core.config import settings

#limiter using client IP
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.REDIS_URL
)

def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )
