"""
PrintFlow ERP — Notification Message Templates
"""
from typing import Optional


def whatsapp_ready_message(
    customer_name: str,
    order_number: int,
    job_title: str,
    shop_name: str = "Saraswathe Graphix",
) -> str:
    return (
        f"Hello {customer_name} 👋,\n\n"
        f"Great news! Your print order *#{order_number}* "
        f"(*{job_title}*) is ready for pickup at *{shop_name}*. 📦\n\n"
        f"Please visit us at your earliest convenience.\n\n"
        f"Thank you for your business! 🙏"
    )


def whatsapp_status_message(
    customer_name: str,
    order_number: int,
    status: str,
    shop_name: str = "Saraswathe Graphix",
) -> str:
    status_labels = {
        "new":       "Order Received 📋",
        "designing": "In Designing Stage 🎨",
        "printing":  "Currently Printing 🖨️",
        "ready":     "Ready for Pickup 📦",
    }
    label = status_labels.get(status, status.title())
    return (
        f"Hello {customer_name} 👋,\n\n"
        f"Your order *#{order_number}* status has been updated to:\n"
        f"*{label}*\n\n"
        f"We'll notify you again when it's ready for pickup.\n\n"
        f"— {shop_name}"
    )


def whatsapp_link(mobile: str, message: str) -> str:
    """Generate a wa.me deep link with pre-filled message."""
    import urllib.parse
    # Ensure mobile has country code
    mobile = mobile.strip().replace(" ", "").replace("-", "")
    if not mobile.startswith("+"):
        mobile = f"91{mobile}"   # Default to India (+91)
    encoded = urllib.parse.quote(message)
    return f"https://wa.me/{mobile}?text={encoded}"


def email_ready_subject(order_number: int) -> str:
    return f"Your Print Order #{order_number} is Ready for Pickup!"


def email_ready_body(
    customer_name: str,
    order_number: int,
    job_title: str,
    shop_name: str = "Saraswathe Graphix",
    shop_mobile: str = "",
) -> str:
    return (
        f"Dear {customer_name},\n\n"
        f"We are pleased to inform you that your print order #{order_number} "
        f"({job_title}) has been completed and is ready for pickup at {shop_name}.\n\n"
        f"Please visit us during business hours to collect your order.\n\n"
        f"For any queries, please contact us at {shop_mobile}.\n\n"
        f"Thank you for choosing {shop_name}!\n\n"
        f"Best Regards,\n{shop_name}"
    )
