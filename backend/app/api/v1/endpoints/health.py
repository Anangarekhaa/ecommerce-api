from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.sessions import get_db
from app.core.redis import redis_client

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/")
def health_check(db: Session = Depends(get_db)):
    status = {
        "status": "ok",
        "database": "unknown",
        "redis": "unknown"
    }

    try:
        db.execute(text("SELECT 1"))
        status["database"] = "connected"
    except Exception:
        status["database"] = "disconnected"

    
    try:
        redis_client.ping()
        status["redis"] = "connected"
    except Exception:
        status["redis"] = "disconnected"

    return status
