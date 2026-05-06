# PrintFlow ERP

> **Lean, offline-first ERP for printing shops.**
> Built for Saraswathe Graphix — manage customers, create GST invoices, track jobs on a Kanban board, and notify customers via WhatsApp.

---

## Features

| Module | Capabilities |
|--------|-------------|
| 🧑‍🤝‍🧑 **CRM** | Customer profiles, mobile-number search, order history |
| 🧾 **Orders / POS** | Line items, CGST/SGST/IGST calculation, PDF invoice download |
| 📋 **Kanban Board** | Drag-and-drop job tracking across New → Designing → Printing → Ready |
| 📈 **Dashboard** | Visual revenue trends (Last 7 days) and job pipeline analytics |
| 📲 **Notifications** | Pre-filled WhatsApp & Email links, notification history log |
| ☁️ **Cloud Backup** | Daily auto-sync to Supabase (configurable), manual trigger |
| 🔒 **Security** | Password-protected system access (Default: `admin123`) |
| ⚙️ **Settings** | Shop GSTIN, address, default GST rate, backup config |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python 3.11+) |
| Local DB | SQLite via SQLAlchemy (zero server, file-based) |
| Cloud Backup | Supabase (PostgreSQL) — optional |
| PDF | jsPDF + jspdf-autotable (client-side) |
| Drag & Drop | @dnd-kit/core |
| Scheduler | APScheduler (daily backup job) |

---

## Quick Start

See **[Setup/SETUP.md](Setup/SETUP.md)** for the full guide.

### TL;DR (3 commands)

```bash
# Terminal 1 — Backend
cd backend && python -m venv venv && .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy ..\Setup\ENV_TEMPLATE.env .env   # then edit .env with your shop details
python main.py

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173** 🚀

---

## Project Structure

```
Saraswathe_Graphix/
├── backend/
│   ├── main.py              ← FastAPI app + scheduler
│   ├── database.py          ← SQLAlchemy SQLite setup
│   ├── models.py            ← ORM models
│   ├── schemas.py           ← Pydantic schemas
│   ├── routers/             ← customers, orders, notifications, settings
│   ├── services/            ← gst, backup, notify
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           ← Dashboard, CRM, Orders, Kanban, Settings
│   │   ├── components/      ← Layout (Sidebar, MobileNav)
│   │   ├── lib/             ← api, gst, pdf, notify
│   │   └── types/           ← TypeScript interfaces
│   └── package.json
├── Setup/
│   ├── 01_sqlite_schema.sql ← SQLite tables (auto-applied)
│   ├── 02_seed_data.sql     ← Demo data
│   ├── 03_supabase_schema.sql ← Cloud backup schema
│   ├── ENV_TEMPLATE.env     ← Copy → backend/.env
│   └── SETUP.md             ← Full setup guide
├── UI_CONTRACT.md           ← Design tokens & component spec
└── README.md                ← This file
```

---

## API Reference

The backend runs at `http://localhost:8000`.
Interactive API docs: **http://localhost:8000/docs**

| Endpoint | Description |
|----------|-------------|
| `GET /customers` | List all customers |
| `GET /customers/search?mobile=` | Search by mobile |
| `POST /customers` | Create customer |
| `GET /orders` | List orders (filter by `?status=`) |
| `GET /orders/kanban` | Kanban board data |
| `POST /orders` | Create order (auto-calculates GST) |
| `PATCH /orders/{id}/status` | Update Kanban status |
| `GET /notifications/whatsapp-link/{id}` | Get WhatsApp wa.me link |
| `POST /backup/trigger` | Trigger manual Supabase backup |
| `GET /health` | Health check |

---

## GST Compliance

- **Intra-State** orders: CGST + SGST (each = rate ÷ 2)
- **Inter-State** orders: IGST (full rate)
- Default HSN Code: `4911` (printed matter)
- Configurable GST rate per line item: 0%, 5%, 12%, 18%, 28%
- PDF invoice includes all GST-required fields (GSTIN, HSN, tax columns)

---

## WhatsApp Notifications

Uses the free **wa.me deep link** approach — no API key required.

Clicking "Notify" opens WhatsApp with a pre-filled message:
```
Hello Ravi 👋,
Your print order #1001 (Flex Banner 10x4 ft) is ready
for pickup at Saraswathe Graphix. 📦
Thank you for your business! 🙏
```

All sends are logged to the `notification_log` table.

---


## 🖥️ Standalone Desktop Mode

PrintFlow can be run as a standalone desktop application with a dedicated icon and no browser interface:

1.  **Launch**: Run `PrintFlow.vbs` to start the system silently in the background.
2.  **App Window**: A dedicated, isolated window (Edge/Chrome App Mode) will open automatically.
3.  **Setup**: See **[DESKTOP_SETUP.md](DESKTOP_SETUP.md)** to create a desktop shortcut with the premium app icon.

---

## License

Private — Saraswathe Graphix internal use only.
