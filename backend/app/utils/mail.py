import time
from app.core.logging import logger

def send_order_confirmation(email: str, order_id: int):
    # Simulate email delay
    time.sleep(2)

    logger.info(
        f"Email sent to {email} for order {order_id}"
    )
