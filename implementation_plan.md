# PrintFlow ERP — Implementation Plan

## Core Architecture
- **Frontend**: Vite + React 18 + Tailwind CSS + Lucide Icons.
- **Backend**: FastAPI + Python 3.13.
- **Local Database**: SQLite (using SQLAlchemy).
- **Cloud Backup**: Daily scheduled sync to Supabase (PostgreSQL).

## Implemented Modules

### 1. CRM (Customer Management)
- Customer profiles with name, mobile (primary search), email, GSTIN, and address.
- Instant mobile/name search.
- Complete order history per customer.
- "Quick Add" and "Walk-in" flows during order creation.

### 2. Sales / POS (Order Creation)
- Multi-item orders with dynamic GST calculation.
- Supports **Intra-State** (CGST/SGST) and **Inter-State** (IGST).
- Priority and Due Date tracking.
- Professional Tax-Compliant PDF generation (saves to Downloads folder).

### 3. Project Tracking (Kanban)
- 4-column status board: **New → Designing → Printing → Ready**.
- Smooth drag-and-drop movement using `@dnd-kit`.
- Color-coded priority indicators and overdue alerts.

### 4. Notifications
- One-click WhatsApp notification with pre-filled professional templates.
- Email notification support.
- Audit log of all sent notifications.

### 5. System & Safety
- **Daily Backup**: Scheduled for 2:00 AM (local time).
- **Manual Backup**: Button in Settings to trigger instant cloud sync.
- **Single-Tenant**: Designed for a high-performance local shop environment.

## Security & Tech Details
- **z-index Layering**: Controlled layering for modals and dropdowns.
- **GST Logic**: Automatic breakdown based on shop state (default 33 - Tamil Nadu).
- **Responsive**: Full mobile and tablet support with touch-friendly targets (min 48px).
