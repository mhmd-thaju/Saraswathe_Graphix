"""
PrintFlow ERP — SQLAlchemy ORM Models
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Float, Integer, ForeignKey, DateTime
)
from sqlalchemy.orm import relationship
from database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Customer(Base):
    __tablename__ = "customers"

    id         = Column(String, primary_key=True, default=_uuid)
    name       = Column(String, nullable=False)
    mobile     = Column(String, nullable=False, unique=True, index=True)
    email      = Column(String)
    gstin      = Column(String)
    address    = Column(Text)
    city       = Column(String)
    state      = Column(String, default="Tamil Nadu")
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")


class Order(Base):
    __tablename__ = "orders"

    id           = Column(String, primary_key=True, default=_uuid)
    order_number = Column(Integer, unique=True)
    customer_id  = Column(String, ForeignKey("customers.id"), nullable=False)
    status       = Column(String, default="new")
    gst_type     = Column(String, default="intra")
    subtotal     = Column(Float, default=0)
    cgst_amount  = Column(Float, default=0)
    sgst_amount  = Column(Float, default=0)
    igst_amount  = Column(Float, default=0)
    total_amount = Column(Float, default=0)
    notes        = Column(Text)
    due_date     = Column(String)
    priority     = Column(String, default="normal")
    created_at   = Column(DateTime(timezone=True), default=_now)
    updated_at   = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    customer   = relationship("Customer", back_populates="orders")
    line_items = relationship("LineItem", back_populates="order", cascade="all, delete-orphan")
    notifications = relationship("NotificationLog", back_populates="order", cascade="all, delete-orphan")


class LineItem(Base):
    __tablename__ = "line_items"

    id          = Column(String, primary_key=True, default=_uuid)
    order_id    = Column(String, ForeignKey("orders.id"), nullable=False)
    description = Column(String, nullable=False)
    hsn_code    = Column(String, default="4911")
    quantity    = Column(Float, default=1)
    unit        = Column(String, default="pcs")
    unit_price  = Column(Float, default=0)
    gst_rate    = Column(Float, default=18)
    amount      = Column(Float, default=0)   # qty * unit_price
    created_at  = Column(DateTime(timezone=True), default=_now)

    order = relationship("Order", back_populates="line_items")


class NotificationLog(Base):
    __tablename__ = "notification_log"

    id       = Column(String, primary_key=True, default=_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    channel  = Column(String, nullable=False)
    message  = Column(Text, nullable=False)
    sent_by  = Column(String, default="staff")
    sent_at  = Column(DateTime(timezone=True), default=_now)

    order = relationship("Order", back_populates="notifications")


class Setting(Base):
    __tablename__ = "settings"

    key        = Column(String, primary_key=True)
    value      = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)
