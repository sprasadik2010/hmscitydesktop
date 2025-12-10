@echo off
cd /d %~dp0
backend\venvhmsalpha\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
pause