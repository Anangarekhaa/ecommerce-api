from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import json
from app.core.redis import redis_client, CACHE_TTL
from typing import List, Optional
from app.db.sessions import get_db
from app.core.security import require_role
from sqlalchemy import or_
from app.models.users import User
from app.models.products import Product
from app.core.redis import invalidate_product_cache
from app.core.logging import logger
from app.schemas.product import (ProductCreate, ProductUpdate, ProductResponse, ProductListResponse)


router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    new_product = Product(**product.dict())

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    invalidate_product_cache()
    logger.info(
    f"Admin {current_user.id} created product {new_product.id}"
    )

    return new_product



@router.get("/", response_model=ProductListResponse)
def get_products(
    db: Session = Depends(get_db),

    # Pagination
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),

    # Filtering
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    
    search: Optional[str] = Query(None, min_length=1),

    # Sorting
    sort_by: Optional[str] = "id",
    order: Optional[str] = "asc"
):
    cache_key = f"products:{page}:{size}:{min_price}:{max_price}:{search}:{sort_by}:{order}"

    cached_data = redis_client.get(cache_key)
    if cached_data:
        print("Cache hit")
        return json.loads(cached_data)
    query = db.query(Product)

    # 🔎 Filtering
    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern)
            )
        )

    #  Sorting
    if hasattr(Product, sort_by):
        column = getattr(Product, sort_by)
        if order == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())

    # Pagination
    total = query.count()
    products = query.offset((page - 1) * size).limit(size).all()

    response = {
        "total": total,
        "page": page,
        "size": size,
        "items": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": p.price,
                "stock": p.stock
            }
            for p in products
        ]
    }

    # Store in Redis with TTL
    redis_client.setex(cache_key, CACHE_TTL, json.dumps(response))

    return response



@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in product_data.dict(exclude_unset=True).items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    invalidate_product_cache()

    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()

    invalidate_product_cache()

    return {"message": "Product deleted"}
