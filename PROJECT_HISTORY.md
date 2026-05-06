# PrintFlow ERP — Project Development History

This document contains a chronological record of the development of the PrintFlow ERP system, covering all major features, architectural decisions, and bug fixes.

---

## 📅 Initial Phase: Project Kickoff & Architecture
**Mission**: Develop "PrintFlow" - A Lean ERP for Printing Shops.
- **Objective**: Build a high-performance, senior-friendly web app for CRM, Sales/POS, Job Tracking (Kanban), and Notifications.
- **Architecture Selected**:
  - **Frontend**: Vite + React 18 + Tailwind CSS.
  - **Backend**: FastAPI (Python 3.13).
  - **Database**: SQLite (Local-first) with SQLAlchemy.
  - **Cloud Backup**: Daily scheduled sync to Supabase.
- **Key Files Created**:
  - `01_sqlite_schema.sql`, `02_seed_data.sql`, `03_supabase_schema.sql`.
  - `backend/main.py`, `models.py`, `schemas.py`, `database.py`.
  - `services/gst.py`, `services/backup.py`, `services/notify.py`.

---

## 🛠️ Phase 2: Frontend Implementation
- **Design System**: Implemented a "Glassmorphism" UI with `Outfit` and `Inter` fonts.
- **Pages Built**:
  - **Dashboard**: Stats and pipeline overview.
  - **CRM**: Customer management with mobile-number primary search.
  - **Orders**: Status-filtered list of print jobs.
  - **New Order**: POS interface with live GST calculation.
  - **Order Detail**: Tracking, status updates, and notification logging.
  - **Kanban**: Drag-and-drop workflow management.
  - **Settings**: Shop configuration and backup management.

---

## 🐞 Phase 3: Bug Fixes & Refinements
- **UI/UX Fixes**:
  - Resolved dropdown z-index stacking issues in the Order form.
  - Added "Walk-in Customer" and "Create New Customer" quick actions to the Order flow.
  - Enabled mobile number search in the customer dropdown.
- **Workflow Improvements**:
  - Overhauled Kanban drag-and-drop collision detection (switched to `rectIntersection`).
  - Added full **Edit** and **Delete** capabilities for orders.
  - Optimized backend startup to handle Python 3.13 dependency wheels.

---

## 📄 Phase 4: Invoicing & Stability
- **Invoicing System**:
  - Initial `jsPDF` implementation was replaced with `pdfMake` for superior browser compatibility and table stability.
  - Implemented a "Blob + Anchor" download trigger to bypass browser security blocks.
  - Standardized invoice filenames to `CustomerName_OrderNumber.pdf`.
- **UX Refinements**:
  - Made entire table rows clickable in the Orders list.
  - Centralized administrative actions (Delete) to detail pages to prevent accidental data loss.

---

## 🚀 Current Status: Stable v1.0
The system is now fully synchronized with:
- **FastAPI Backend** (Local SQLite).
- **Vite Frontend** (Responsive & Interactive).
- **Automated Cloud Backups** (Supabase integration ready).
- **Professional GST Invoicing** (pdfMake engine).

---

*Generated on: 2026-05-06*
