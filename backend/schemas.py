"""
PrintFlow ERP — Pydantic Schemas (Request / Response)
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator


# ──────────────────────────────────────────────
# Customer
# ──────────────────────────────────────────────
class CustomerBase(BaseModel):
    name:    str
    mobile:  str
    email:   Optional[str] = None
    gstin:   Optional[str] = None
    address: Optional[str] = None
    city:    Optional[str] = None
    state:   str = "Tamil Nadu"

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        digits = v.replace("+91", "").replace(" ", "").replace("-", "")
        if not digits.isdigit() or len(digits) != 10:
            raise ValueError("Mobile must be a 10-digit number")
        return digits


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name:    Optional[str] = None
    email:   Optional[str] = None
    gstin:   Optional[str] = None
    address: Optional[str] = None
    city:    Optional[str] = None
    state:   Optional[str] = None


class CustomerOut(CustomerBase):
    id:         str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CustomerWithOrders(CustomerOut):
    orders: List["OrderSummary"] = []


# ──────────────────────────────────────────────
# Line Item
# ──────────────────────────────────────────────
class LineItemBase(BaseModel):
    description: str
    hsn_code:    str = "4911"
    quantity:    float = 1
    unit:        str = "pcs"
    unit_price:  float
    gst_rate:    float = 18


class LineItemCreate(LineItemBase):
    pass


class LineItemOut(LineItemBase):
    id:         str
    order_id:   str
    amount:     float
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Order
# ──────────────────────────────────────────────
class OrderCreate(BaseModel):
    customer_id: str
    gst_type:    str = "intra"          # intra | inter
    notes:       Optional[str] = None
    due_date:    Optional[str] = None
    priority:    str = "normal"
    line_items:  List[LineItemCreate]

    @field_validator("gst_type")
    @classmethod
    def validate_gst_type(cls, v: str) -> str:
        if v not in ("intra", "inter"):
            raise ValueError("gst_type must be 'intra' or 'inter'")
        return v


class OrderStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid = {"new", "designing", "printing", "ready"}
        if v not in valid:
            raise ValueError(f"status must be one of {valid}")
        return v


class OrderSummary(BaseModel):
    id:           str
    order_number: int
    customer_name: str
    status:       str
    priority:     str
    total_amount: float
    due_date:     Optional[str]
    created_at:   datetime

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id:           str
    order_number: int
    customer_id:  str
    status:       str
    gst_type:     str
    subtotal:     float
    cgst_amount:  float
    sgst_amount:  float
    igst_amount:  float
    total_amount: float
    notes:        Optional[str]
    due_date:     Optional[str]
    priority:     str
    created_at:   datetime
    updated_at:   datetime
    customer:     CustomerOut
    line_items:   List[LineItemOut] = []

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Notification
# ──────────────────────────────────────────────
class NotificationCreate(BaseModel):
    order_id: str
    channel:  str       # whatsapp | email | sms
    message:  str
    sent_by:  str = "staff"


class NotificationOut(BaseModel):
    id:       str
    order_id: str
    channel:  str
    message:  str
    sent_by:  str
    sent_at:  datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Settings
# ──────────────────────────────────────────────
class SettingUpdate(BaseModel):
    value: str


class SettingsOut(BaseModel):
    key:        str
    value:      str
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Kanban
# ──────────────────────────────────────────────
class KanbanCardOut(BaseModel):
    id:             str
    order_number:   int
    customer_name:  str
    customer_mobile: str
    status:         str
    priority:       str
    job_title:      str   # First line item description or notes
    total_amount:   float
    due_date:       Optional[str]
    created_at:     datetime

    model_config = {"from_attributes": True}


# Resolve forward references
CustomerWithOrders.model_rebuild()
