@echo off
echo =========================================================================
echo  INSPECTRA — Integrated Risk-Based Monitoring & Inspection Platform
echo =========================================================================
echo Launching Flask Backend and Vite Web Frontend concurrently...
start "INSPECTRA Backend" cmd /k "cd /d "%~dp0" && backend\venv\Scripts\python -m backend.app"
timeout /t 3 /nobreak >nul
start "INSPECTRA Web" cmd /k "cd /d "%~dp0\web" && npm run dev"
echo Both services launched! Access the application at http://localhost:5173
pause
