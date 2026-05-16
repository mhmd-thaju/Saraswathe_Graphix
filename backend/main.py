"""
PrintFlow ERP — FastAPI Application Entry Point
"""
import os
import sys
import logging
import webbrowser
import threading
import time
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
FRONTEND_URL  = os.getenv("FRONTEND_URL", "http://localhost:8000")

# Path handling for PyInstaller
if getattr(sys, 'frozen', False):
    # Running in a bundle
    BASE_DIR = Path(sys._MEIPASS)
else:
    # Running in normal python environment
    BASE_DIR = Path(__file__).resolve().parent.parent

STATIC_DIR = BASE_DIR / "frontend" / "dist"

scheduler = BackgroundScheduler()

def open_browser():
    """Wait for server and open browser in app mode."""
    time.sleep(1.5)
    url = "http://127.0.0.1:8000"
    # Try Edge App Mode, then Chrome App Mode, then fallback
    try:
        os.system(f'start msedge --app="{url}"')
    except:
        try:
            os.system(f'start chrome --app="{url}"')
        except:
            webbrowser.open(url)


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
    
    # Auto-launch browser if not in reload mode
    if not os.getenv("RUNNING_AS_RELOADER"):
        threading.Thread(target=open_browser, daemon=True).start()
        
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers ────────────────────────────────────────────────
app.include_router(customers.router,     prefix="/api")
app.include_router(orders.router,        prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")


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


# ── Frontend Serving ──────────────────────────────────────────
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # API routes are already handled above. 
        # If it's not an API route, serve index.html for SPA support.
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None # Should be handled by routers
        
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        
        return FileResponse(STATIC_DIR / "index.html")
else:
    logger.warning(f"Static directory not found at {STATIC_DIR}. Frontend will not be served.")


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
        reload=not getattr(sys, 'frozen', False),
    )
