from fastapi import FastAPI
from app.db.base import Base
from app.db.sessions import engine
from app.api.v1.endpoints import auth
from app.api.v1.endpoints import products
from app.api.v1.endpoints import orders
from app.core.ratelimit import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api.v1.endpoints import health



app=FastAPI(title="E-commerce API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
Base.metadata.create_all(bind=engine)
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(health.router)

@app.get("/")
def root():
    return {"message":"Welcome to the E-commerce API!"}