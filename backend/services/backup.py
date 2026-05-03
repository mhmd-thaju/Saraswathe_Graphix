"""
PrintFlow ERP — Daily Supabase Backup Service
Runs at 2:00 AM via APScheduler and syncs SQLite → Supabase
"""
import os
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("printflow.backup")

SUPABASE_URL     = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY     = os.getenv("SUPABASE_SERVICE_KEY", "")
BACKUP_ENABLED   = os.getenv("BACKUP_ENABLED", "true").lower() == "true"


def _get_supabase_client():
    """Returns a Supabase client if credentials are configured."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    try:
        from supabase import create_client
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
        return None


def run_backup(db: Session) -> dict:
    """
    Full sync: upsert all SQLite records into Supabase.
    Returns a summary dict with counts and status.
    """
    if not BACKUP_ENABLED:
        return {"status": "skipped", "reason": "Backup disabled in config"}

    client = _get_supabase_client()
    if not client:
        return {"status": "failed", "reason": "Supabase not configured"}

    from models import Customer, Order, LineItem, NotificationLog, Setting

    summary = {"status": "success", "synced": {}, "errors": []}
    started = datetime.now(timezone.utc)

    try:
        # ── Customers ──
        customers = db.query(Customer).all()
        if customers:
            rows = [
                {
                    "id": c.id, "name": c.name, "mobile": c.mobile,
                    "email": c.email, "gstin": c.gstin, "address": c.address,
                    "city": c.city, "state": c.state,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                    "updated_at": c.updated_at.isoformat() if c.updated_at else None,
                    "synced_at": started.isoformat(),
                }
                for c in customers
            ]
            client.table("customers").upsert(rows).execute()
            summary["synced"]["customers"] = len(rows)

        # ── Orders ──
        orders = db.query(Order).all()
        if orders:
            rows = [
                {
                    "id": o.id, "order_number": o.order_number,
                    "customer_id": o.customer_id, "status": o.status,
                    "gst_type": o.gst_type, "subtotal": o.subtotal,
                    "cgst_amount": o.cgst_amount, "sgst_amount": o.sgst_amount,
                    "igst_amount": o.igst_amount, "total_amount": o.total_amount,
                    "notes": o.notes, "due_date": o.due_date,
                    "priority": o.priority,
                    "created_at": o.created_at.isoformat() if o.created_at else None,
                    "updated_at": o.updated_at.isoformat() if o.updated_at else None,
                    "synced_at": started.isoformat(),
                }
                for o in orders
            ]
            client.table("orders").upsert(rows).execute()
            summary["synced"]["orders"] = len(rows)

        # ── Line Items ──
        items = db.query(LineItem).all()
        if items:
            rows = [
                {
                    "id": li.id, "order_id": li.order_id,
                    "description": li.description, "hsn_code": li.hsn_code,
                    "quantity": li.quantity, "unit": li.unit,
                    "unit_price": li.unit_price, "gst_rate": li.gst_rate,
                    "amount": li.amount,
                    "created_at": li.created_at.isoformat() if li.created_at else None,
                    "synced_at": started.isoformat(),
                }
                for li in items
            ]
            client.table("line_items").upsert(rows).execute()
            summary["synced"]["line_items"] = len(rows)

        # ── Notification Logs ──
        logs = db.query(NotificationLog).all()
        if logs:
            rows = [
                {
                    "id": n.id, "order_id": n.order_id, "channel": n.channel,
                    "message": n.message, "sent_by": n.sent_by,
                    "sent_at": n.sent_at.isoformat() if n.sent_at else None,
                    "synced_at": started.isoformat(),
                }
                for n in logs
            ]
            client.table("notification_log").upsert(rows).execute()
            summary["synced"]["notifications"] = len(rows)

        # ── Settings ──
        settings = db.query(Setting).all()
        if settings:
            rows = [
                {
                    "key": s.key, "value": s.value,
                    "updated_at": s.updated_at.isoformat() if s.updated_at else None,
                    "synced_at": started.isoformat(),
                }
                for s in settings
            ]
            client.table("settings").upsert(rows).execute()
            summary["synced"]["settings"] = len(rows)

        summary["completed_at"] = datetime.now(timezone.utc).isoformat()
        logger.info(f"Backup completed: {summary['synced']}")

    except Exception as e:
        summary["status"] = "failed"
        summary["errors"].append(str(e))
        logger.error(f"Backup failed: {e}")

    return summary


# Store last backup result in memory for the /backup/status endpoint
_last_backup: dict = {"status": "never", "completed_at": None}


def get_last_backup_status() -> dict:
    return _last_backup


def scheduled_backup_job(SessionLocal):
    """Called by APScheduler — creates its own DB session."""
    db = SessionLocal()
    try:
        global _last_backup
        result = run_backup(db)
        _last_backup = result
    finally:
        db.close()
