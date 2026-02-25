
from fastapi import APIRouter, Depends, HTTPException
from fastapi import BackgroundTasks
from app.utils.mail import send_order_confirmation
from sqlalchemy.orm import Session
from app.db.sessions import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.models.orders import Order
from app.models.orderitems import OrderItem
from app.models.products import Product
from app.core.security import get_current_user
from app.models.users import User
from typing import List
from app.core.security import require_role
from app.core.logging import logger


router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        total_price = 0
        order = Order(user_id=current_user.id)
        db.add(order)
        db.flush()

        for item in order_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()

            if not product:
                logger.warning(
                    f"Product {item.product_id} not found for user {current_user.id}"
                )
                raise HTTPException(status_code=404, detail="Product not found")

            if product.stock < item.quantity:
                logger.warning(
                    f"Not enough stock for product {product.id} "
                )
                raise HTTPException(status_code=400, detail="Not enough stock")

            product.stock -= item.quantity
            item_total = product.price * item.quantity
            total_price += item_total

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                price_at_purchase=product.price
            )

            db.add(order_item)

        order.total_price = total_price
        db.commit()
        db.refresh(order)

        logger.info(
            f"User {current_user.id} created order {order.id}"
        )

        background_tasks.add_task(
        send_order_confirmation,
        current_user.email,
        order.id
        )

        return order
    
    except Exception as e:
        db.rollback()
        logger.error(
            f"Order creation failed for user {current_user.id}: {str(e)}"
        )
          
        raise e


@router.get("/me", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(Order).filter(
        Order.user_id == current_user.id
    ).all()

    return orders


@router.get("/", response_model=List[OrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    return db.query(Order).all()


@router.put("/{order_id}/status")
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_data.status
    db.commit()

    return {"message": "Order status updated"}