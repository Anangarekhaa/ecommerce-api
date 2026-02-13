from app.core.config import settings
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

engine=create_engine(settings.DATABASE)

session=sessionmaker(autocommit=False,autoflush=False,bind=engine)

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()