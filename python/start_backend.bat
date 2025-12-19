@echo off
cd /d %~dp0
backend\venvhmsalpha\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
pause