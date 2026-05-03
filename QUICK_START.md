# 🚀 PrintFlow — Quick Start Guide

This file explains how to get the project running and how to configure your Cloud Backup.

---

## 1. How to Run the Project

Open two separate terminals (one for backend, one for frontend).

### 🖥️ Start Backend (FastAPI)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```
*Backend runs at: http://localhost:8000*

### 🎨 Start Frontend (Vite)
```powershell
cd frontend
npm run dev
```
*Frontend runs at: http://localhost:5173*

---

## 2. Configuring Supabase Cloud Backup

To enable daily backups to the cloud:

1.  **Create Project**: Sign up at [supabase.com](https://supabase.com) and create a new project.
2.  **Run SQL**: Go to the "SQL Editor" in Supabase and paste the contents of `Setup/03_supabase_schema.sql`. Run it.
3.  **Get Keys**: Go to **Project Settings > API** in Supabase.
4.  **Edit .env**: Open `backend/.env` in your editor and fill in:
    - `SUPABASE_URL`: Your project URL.
    - `SUPABASE_SERVICE_KEY`: Your **service_role** key (keep this secret).
    - `BACKUP_ENABLED`: Change to `true`.
5.  **Restart**: Restart the backend server.

---

## 3. Loading Demo Data
If you want to see sample customers and orders immediately, run this command in your terminal:
```powershell
cd backend
.\venv\Scripts\python.exe -c "import sqlite3; db=sqlite3.connect('printflow.db'); db.executescript(open('../Setup/02_seed_data.sql').read()); db.commit(); db.close(); print('Demo data loaded!')"
```

---

## 4. Troubleshooting
- **Port Error**: If 8000 or 5173 is in use, check if another instance is running.
- **Python Error**: Ensure you have activated the virtual environment (`.\venv\Scripts\Activate.ps1`).
- **Dependencies**: If things don't run, try `npm install` in frontend or `pip install -r requirements.txt` in backend.
