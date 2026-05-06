@echo off
setlocal
title PrintFlow ERP - System Launcher

echo ========================================
echo   PRINTFLOW ERP - STANDALONE LAUNCHER
echo ========================================
echo.

:: Check if backend venv exists
if not exist "backend\venv" (
    echo [ERROR] Backend virtual environment not found.
    echo Please run setup first.
    pause
    exit /b
)

:: 1. Start Backend (Minimized)
echo [1/3] Starting Backend Server...
start /min "PrintFlow Backend" cmd /c "cd backend && venv\Scripts\activate && python main.py"

:: 2. Start Frontend (Minimized)
echo [2/3] Starting Frontend Server...
start /min "PrintFlow Frontend" cmd /c "cd frontend && npm run dev"

:: 3. Wait for servers to be ready
echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak > nul

:: 4. Launch in App Mode (Isolated Browser Window)
echo Opening PrintFlow...

:: Try Microsoft Edge first (Native on Windows)
set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE_PATH%" (
    start "" "%EDGE_PATH%" --app="http://localhost:5173" --window-size=1280,800
    goto end
)

:: Fallback to Chrome
set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" --app="http://localhost:5173" --window-size=1280,800
    goto end
)

:: Fallback to default browser
echo [WARNING] Chrome/Edge not found in standard paths. Opening in default browser...
start http://localhost:5173

:end
echo.
echo PrintFlow is now running in standalone mode.
echo Do not close the minimized windows while using the app.
timeout /t 3 > nul
exit
