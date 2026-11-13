Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " SOWBHAGYA CHITS & FINSERVE - STARTING FULL-STACK APPLICATION" -ForegroundColor Gold
Write-Host "=====================================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"

Write-Host "`n1. Launching FastAPI Backend (http://127.0.0.1:8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; .\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "2. Launching React Vite Frontend (http://localhost:5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev"

Write-Host "`nBoth services launched in separate windows!" -ForegroundColor Yellow
Write-Host "Frontend Portal:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "FastAPI Swagger:  http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

