"""
PrintFlow ERP — Orders Router (includes GST calc + Kanban status)
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import models, schemas
from database import get_db
from services.gst import calculate_gst

router = APIRouter(prefix="/orders", tags=["Orders"])


def _next_order_number(db: Session) -> int:
    max_num = db.query(models.Order.order_number).order_by(
        models.Order.order_number.desc()
    ).first()
    return (max_num[0] + 1) if max_num and max_num[0] else 1001


@router.get("", response_model=List[schemas.OrderSummary])
def list_orders(
    status: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(models.Order)
    if status:
        query = query.filter(models.Order.status == status)
    return query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/kanban", response_model=List[schemas.KanbanCardOut])
def get_kanban_board(db: Session = Depends(get_db)):
    """Return all orders formatted as Kanban cards."""
    orders = (
        db.query(models.Order)
        .join(models.Customer)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    cards = []
    for o in orders:
        job_title = (
            o.line_items[0].description if o.line_items else (o.notes or "Print Job")
        )
        cards.append(
            schemas.KanbanCardOut(
                id=o.id,
                order_number=o.order_number,
                customer_name=o.customer.name,
                customer_mobile=o.customer.mobile,
                status=o.status,
                priority=o.priority,
                job_title=job_title,
                total_amount=o.total_amount,
                due_date=o.due_date,
                created_at=o.created_at,
            )
        )
    return cards


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=schemas.OrderOut, status_code=201)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Validate customer
    customer = db.query(models.Customer).filter(models.Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Calculate amounts for each line item
    items_data = []
    for li in payload.line_items:
        amount = round(li.quantity * li.unit_price, 2)
        items_data.append({**li.model_dump(), "amount": amount})

    # Calculate GST totals
    gst = calculate_gst(items_data, payload.gst_type)

    # Create order
    order = models.Order(
        order_number = _next_order_number(db),
        customer_id  = payload.customer_id,
        gst_type     = payload.gst_type,
        subtotal     = gst.subtotal,
        cgst_amount  = gst.cgst_amount,
        sgst_amount  = gst.sgst_amount,
        igst_amount  = gst.igst_amount,
        total_amount = gst.total,
        notes        = payload.notes,
        due_date     = payload.due_date,
        priority     = payload.priority,
        status       = "new",
    )
    db.add(order)
    db.flush()   # Get the order.id before committing

    # Create line items
    for item_data in items_data:
        db.add(models.LineItem(order_id=order.id, **item_data))

    db.commit()
    db.refresh(order)
    return order


@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(
    order_id: str,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()


@router.put("/{order_id}", response_model=schemas.OrderOut)
def update_order(order_id: str, payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Recalculate everything
    items_data = []
    for li in payload.line_items:
        amount = round(li.quantity * li.unit_price, 2)
        items_data.append({**li.model_dump(), "amount": amount})

    gst = calculate_gst(items_data, payload.gst_type)

    # Update order fields
    order.customer_id = payload.customer_id
    order.gst_type    = payload.gst_type
    order.subtotal    = gst.subtotal
    order.cgst_amount = gst.cgst_amount
    order.sgst_amount = gst.sgst_amount
    order.igst_amount = gst.igst_amount
    order.total_amount = gst.total
    order.notes       = payload.notes
    order.due_date    = payload.due_date
    order.priority    = payload.priority

    # Replace line items (delete old ones first)
    db.query(models.LineItem).filter(models.LineItem.order_id == order_id).delete()
    for item_data in items_data:
        db.add(models.LineItem(order_id=order.id, **item_data))

    db.commit()
    db.refresh(order)
    return order
