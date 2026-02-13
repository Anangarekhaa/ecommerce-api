from pydantic import BaseModel
from typing import List

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str

class OrderItemResponse(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: float

    class Config:
        orm_mode = True

class OrderResponse(BaseModel):
    id: int
    total_price: float
    status: str
    items: List[OrderItemResponse]

    class Config:
        orm_mode = True

