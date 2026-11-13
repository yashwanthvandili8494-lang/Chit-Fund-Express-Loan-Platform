@echo off
echo =====================================================================
echo  SOWBHAGYA CHITS & FINSERVE - STARTING FULL-STACK APPLICATION
echo =====================================================================
echo.
echo 1. Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"

echo 2. Starting React Vite Frontend on http://localhost:5173 ...
start "Frontend - Vite React" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo API Docs: http://127.0.0.1:8000/docs
echo Web App:  http://localhost:5173
echo =====================================================================
pause

