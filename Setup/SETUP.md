# PrintFlow ERP — Setup Guide
# File: Setup/SETUP.md

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.11+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| Git | Any | https://git-scm.com |

---

## Step 1 — Clone / Open the Project

```bash
# The project is already at:
cd "d:\Work\Startup\Saraswathe_Graphix"
```

---

## Step 2 — Backend Setup (FastAPI)

### 2a. Create Python virtual environment

```bash
cd backend
python -m venv venv
```

### 2b. Activate the virtual environment

```bash
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (CMD)
.\venv\Scripts\activate.bat

# Mac/Linux
source venv/bin/activate
```

### 2c. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 2d. Create the environment file

```bash
# Copy the template
copy ..\Setup\ENV_TEMPLATE.env .env

# Then open .env in your editor and fill in:
#   SHOP_NAME, SHOP_GSTIN, SHOP_MOBILE, SHOP_EMAIL, SHOP_ADDRESS
#   (Supabase keys are optional — skip to enable later)
```

### 2e. Start the backend

```bash
python main.py
```

The backend will:
- ✅ Auto-create `printflow.db` (SQLite database)
- ✅ Create all tables automatically
- ✅ Seed default settings from your `.env` file
- ✅ Start at http://127.0.0.1:8000

> **Verify:** Open http://127.0.0.1:8000/docs in your browser — you should see the Swagger API docs.

---

## Step 3 — Frontend Setup (Vite + React)

### 3a. Install Node dependencies

```bash
cd ..\frontend
npm install
```

### 3b. Start the frontend dev server

```bash
npm run dev
```

The frontend starts at **http://localhost:5173**

> The Vite dev server proxies all `/api/*` requests to the FastAPI backend automatically.

---

## Step 4 — Load Sample Data (Optional)

To load demo customers and orders for testing:

```bash
# From the project root, run with Python's sqlite3
cd backend
python -c "
import sqlite3, os
db = sqlite3.connect('printflow.db')
with open('../Setup/02_seed_data.sql') as f:
    db.executescript(f.read())
db.commit(); db.close()
print('Seed data loaded!')
"
```

---

## Step 5 — Setup Supabase Cloud Backup (Optional)

### 5a. Create a Supabase project

1. Go to https://supabase.com → **New Project**
2. Name it `printflow-backup`, choose a region closest to India
3. Wait for project to initialize (~2 minutes)

### 5b. Run the backup schema

1. In Supabase dashboard → **SQL Editor**
2. Paste the contents of `Setup/03_supabase_schema.sql`
3. Click **Run**

### 5c. Get your API keys

1. Supabase dashboard → **Project Settings → API**
2. Copy:
   - **Project URL** → paste as `SUPABASE_URL` in `backend/.env`
   - **service_role key** (not anon!) → paste as `SUPABASE_SERVICE_KEY`

### 5d. Restart backend

```bash
# Stop with Ctrl+C, then restart:
python main.py
```

Backup now runs automatically at **2:00 AM daily**.
You can also trigger manually from the **Settings** page in the app.

---

## Running Both Servers Together (Recommended)

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd "d:\Work\Startup\Saraswathe_Graphix\backend"
.\venv\Scripts\Activate.ps1
python main.py
```

**Terminal 2 — Frontend:**
```bash
cd "d:\Work\Startup\Saraswathe_Graphix\frontend"
npm run dev
```

Then open: **http://localhost:5173**

---

## Folder Structure Quick Reference

```
Saraswathe_Graphix/
├── backend/               ← FastAPI + SQLite backend
│   ├── main.py            ← Entry point — run this
│   ├── printflow.db       ← Auto-created SQLite database
│   ├── .env               ← Your secrets (copy from Setup/ENV_TEMPLATE.env)
│   └── requirements.txt   ← pip install -r this
├── frontend/              ← Vite + React frontend
│   ├── src/               ← All React source code
│   └── package.json       ← npm install this
└── Setup/                 ← You are here
    ├── 01_sqlite_schema.sql     ← SQLite DB schema (auto-applied on startup)
    ├── 02_seed_data.sql         ← Optional demo data
    ├── 03_supabase_schema.sql   ← Run in Supabase SQL Editor
    ├── ENV_TEMPLATE.env         ← Copy to backend/.env and fill in
    └── SETUP.md                 ← This file
```

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `python` not found | Use `python3` instead, or install Python 3.11+ |
| Port 8000 in use | Edit `APP_PORT=8001` in `.env` |
| Port 5173 in use | Run `npm run dev -- --port 5174` |
| CORS errors | Ensure backend is running at `http://127.0.0.1:8000` |
| `venv\Scripts\Activate.ps1` blocked | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` in PowerShell |
| Supabase backup says "not configured" | Double-check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env` |
