"""
PrintFlow ERP — GST Calculation Service
"""
from dataclasses import dataclass
from typing import List


@dataclass
class LineItemGST:
    amount:     float   # subtotal for this item (qty * unit_price)
    gst_rate:   float   # e.g. 18.0
    cgst:       float = 0.0
    sgst:       float = 0.0
    igst:       float = 0.0
    total:      float = 0.0


@dataclass
class GSTSummary:
    subtotal:    float
    cgst_amount: float
    sgst_amount: float
    igst_amount: float
    total:       float


def calculate_gst(
    line_items: List[dict],   # [{"amount": float, "gst_rate": float}]
    gst_type: str             # "intra" | "inter"
) -> GSTSummary:
    """
    Calculate GST for a list of line items.

    Intra-state: CGST = SGST = gst_rate / 2 each
    Inter-state: IGST = gst_rate (full)
    """
    subtotal    = 0.0
    cgst_total  = 0.0
    sgst_total  = 0.0
    igst_total  = 0.0

    for item in line_items:
        amount   = float(item.get("amount", 0))
        gst_rate = float(item.get("gst_rate", 18))
        subtotal += amount

        if gst_type == "intra":
            half_rate   = gst_rate / 2
            cgst_total += round(amount * half_rate / 100, 2)
            sgst_total += round(amount * half_rate / 100, 2)
        else:
            igst_total += round(amount * gst_rate / 100, 2)

    total = round(subtotal + cgst_total + sgst_total + igst_total, 2)
    subtotal = round(subtotal, 2)

    return GSTSummary(
        subtotal    = subtotal,
        cgst_amount = round(cgst_total, 2),
        sgst_amount = round(sgst_total, 2),
        igst_amount = round(igst_total, 2),
        total       = total,
    )
