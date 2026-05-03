@echo off
echo Starting PrintFlow ERP...

:: Start Backend
start cmd /k "echo Starting Backend... && cd backend && venv\Scripts\activate && python main.py"

:: Start Frontend
start cmd /k "echo Starting Frontend... && cd frontend && npm run dev"

echo Servers are booting up.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Please wait a few seconds for Vite to start...
pause
