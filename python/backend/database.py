from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .app.models.models import Base
import os

APP_DATA_DIR = os.path.join(
    os.environ["LOCALAPPDATA"],
    "HMSLite"
)

os.makedirs(APP_DATA_DIR, exist_ok=True)

db_path = os.path.join(APP_DATA_DIR, "hms_lite.db")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=True  # Set to False in production
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()