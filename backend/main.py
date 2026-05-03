"""
PrintFlow ERP — FastAPI Application Entry Point
"""
import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler

import models
from database import engine, SessionLocal
from routers import customers, orders, notifications, settings as settings_router
from services.backup import scheduled_backup_job, get_last_backup_status, run_backup

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("printflow")

BACKUP_HOUR   = int(os.getenv("BACKUP_CRON_HOUR",   "2"))
BACKUP_MINUTE = int(os.getenv("BACKUP_CRON_MINUTE", "0"))
FRONTEND_URL  = os.getenv("FRONTEND_URL", "http://localhost:5173")

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────
    logger.info("Creating database tables…")
    models.Base.metadata.create_all(bind=engine)
    _seed_default_settings()

    logger.info(f"Scheduling daily backup at {BACKUP_HOUR:02d}:{BACKUP_MINUTE:02d}")
    scheduler.add_job(
        scheduled_backup_job,
        trigger="cron",
        hour=BACKUP_HOUR,
        minute=BACKUP_MINUTE,
        args=[SessionLocal],
        id="daily_backup",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("PrintFlow backend started ✅")
    yield

    # ── Shutdown ─────────────────────────────────────────────
    scheduler.shutdown(wait=False)
    logger.info("PrintFlow backend stopped")


app = FastAPI(
    title="PrintFlow ERP API",
    description="Lean ERP for printing shops — by Saraswathe Graphix",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(notifications.router)
app.include_router(settings_router.router)


# ── Backup Endpoints ──────────────────────────────────────────
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db

@app.post("/backup/trigger", tags=["Backup"])
def trigger_manual_backup(db: Session = Depends(get_db)):
    """Manually trigger a Supabase backup."""
    result = run_backup(db)
    return result


@app.get("/backup/status", tags=["Backup"])
def backup_status():
    """Get the last backup result."""
    return get_last_backup_status()


# ── Health ────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "app": "PrintFlow ERP", "version": "1.0.0"}


# ── Helpers ───────────────────────────────────────────────────
def _seed_default_settings():
    """Insert default settings on first run if not present."""
    db = SessionLocal()
    try:
        defaults = {
            "shop_name":        os.getenv("SHOP_NAME",    "Saraswathe Graphix"),
            "shop_gstin":       os.getenv("SHOP_GSTIN",   ""),
            "shop_address":     os.getenv("SHOP_ADDRESS", ""),
            "shop_city":        os.getenv("SHOP_CITY",    ""),
            "shop_state":       os.getenv("SHOP_STATE",   "Tamil Nadu"),
            "shop_state_code":  os.getenv("SHOP_STATE_CODE", "33"),
            "shop_mobile":      os.getenv("SHOP_MOBILE",  ""),
            "shop_email":       os.getenv("SHOP_EMAIL",   ""),
            "default_gst_rate": "18",
            "default_gst_type": "intra",
            "invoice_prefix":   "SGX",
            "backup_enabled":   "true",
        }
        for key, val in defaults.items():
            existing = db.query(models.Setting).filter(models.Setting.key == key).first()
            if not existing:
                db.add(models.Setting(key=key, value=val))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("APP_HOST", "127.0.0.1"),
        port=int(os.getenv("APP_PORT", "8000")),
        reload=True,
    )
