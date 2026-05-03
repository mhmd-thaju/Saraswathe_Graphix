"""
PrintFlow ERP — Notifications Router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from services.notify import whatsapp_link, whatsapp_ready_message, whatsapp_status_message

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("", response_model=schemas.NotificationOut, status_code=201)
def log_notification(payload: schemas.NotificationCreate, db: Session = Depends(get_db)):
    """Log that a notification was sent."""
    order = db.query(models.Order).filter(models.Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    log = models.NotificationLog(
        order_id=payload.order_id,
        channel=payload.channel,
        message=payload.message,
        sent_by=payload.sent_by,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/order/{order_id}", response_model=List[schemas.NotificationOut])
def get_order_notifications(order_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.NotificationLog)
        .filter(models.NotificationLog.order_id == order_id)
        .order_by(models.NotificationLog.sent_at.desc())
        .all()
    )


@router.get("/whatsapp-link/{order_id}")
def get_whatsapp_link(order_id: str, msg_type: str = "ready", db: Session = Depends(get_db)):
    """
    Generate a pre-filled WhatsApp wa.me link for an order.
    msg_type: 'ready' | 'status'
    """
    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    customer = order.customer
    job_title = (
        order.line_items[0].description if order.line_items else (order.notes or "Print Job")
    )
    shop_name = _get_setting(db, "shop_name", "Saraswathe Graphix")

    if msg_type == "ready":
        message = whatsapp_ready_message(
            customer_name=customer.name,
            order_number=order.order_number,
            job_title=job_title,
            shop_name=shop_name,
        )
    else:
        message = whatsapp_status_message(
            customer_name=customer.name,
            order_number=order.order_number,
            status=order.status,
            shop_name=shop_name,
        )

    link = whatsapp_link(customer.mobile, message)
    return {"link": link, "message": message, "mobile": customer.mobile}


def _get_setting(db: Session, key: str, default: str = "") -> str:
    setting = db.query(models.Setting).filter(models.Setting.key == key).first()
    return setting.value if setting else default
