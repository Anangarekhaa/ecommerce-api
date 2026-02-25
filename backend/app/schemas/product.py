from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[ProductResponse]
    model_config = ConfigDict(from_attributes=True)
