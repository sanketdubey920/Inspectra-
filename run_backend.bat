@echo off
echo Starting INSPECTRA Flask REST API Backend on http://localhost:5000...
cd /d "%~dp0"
backend\venv\Scripts\python -m backend.app
pause
