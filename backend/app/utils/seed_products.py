import csv
import os
from decimal import Decimal

from app.db.sessions import session
from app.models.products import Product


def load_csv_and_seed(csv_path: str):
    if not os.path.exists(csv_path):
        print(f"CSV file not found: {csv_path}")
        return

    db = session()
    try:
        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            count = 0
            for row in reader:
                if not row or len(row) < 5:
                    continue
                try:
                    pid = int(row[0])
                except Exception:
                    continue

                name = row[1].strip()
                description = row[2].strip() if row[2] else ''
                try:
                    price = float(row[3])
                except Exception:
                    # fallback: try Decimal then float
                    price = float(Decimal(row[3])) if row[3] else 0.0
                try:
                    stock = int(row[4])
                except Exception:
                    stock = 0

                # check exists
                existing = db.query(Product).filter(Product.id == pid).first()
                if existing:
                    # update fields
                    existing.name = name
                    existing.description = description
                    existing.price = price
                    existing.stock = stock
                else:
                    p = Product(id=pid, name=name, description=description, price=price, stock=stock)
                    db.add(p)
                count += 1

            db.commit()
            print(f"Seeded/updated {count} products from {csv_path}")
    except Exception as e:
        db.rollback()
        print(f"Error seeding products: {e}")
    finally:
        db.close()


if __name__ == '__main__':
    # CSV path relative to repo root
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '..', 'products.csv')
    # try a few likely locations
    candidates = [
        os.path.join(os.getcwd(), 'products.csv'),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'products.csv'),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'products.csv'),
    ]
    for p in candidates:
        if os.path.exists(p):
            csv_path = p
            break

    print(f"Seeding from: {csv_path}")
    load_csv_and_seed(csv_path)
