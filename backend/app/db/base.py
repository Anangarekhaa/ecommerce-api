from sqlalchemy.ext.declarative import declarative_base

Base=declarative_base()

from app.models.users import User
from app.models.products import Product
from app.models.orders import Order
from app.models.orderitems import OrderItem