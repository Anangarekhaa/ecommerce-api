from pydantic import BaseModel, ConfigDict
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

    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: int
    total_price: float
    status: str
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)

