"""
PrintFlow ERP — Database Configuration
SQLAlchemy engine + session factory for SQLite
"""
import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

# Determine base path for the database file
if getattr(sys, 'frozen', False):
    # If running as an EXE, put DB in the same folder as the EXE
    EXE_DIR = Path(sys.executable).parent
    SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", str(EXE_DIR / "printflow.db"))
else:
    # Normal dev mode
    SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "./printflow.db")

DATABASE_URL = f"sqlite:///{SQLITE_DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

# Enable WAL mode and foreign keys for every connection
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, _):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
