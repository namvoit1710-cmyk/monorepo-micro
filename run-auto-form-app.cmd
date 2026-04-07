@echo off
cd /d "%~dp0"

echo [1/2] Installing dependencies...
call pnpm install
if errorlevel 1 exit /b 1

echo.
echo [2/2] Starting auto-form-app (browser will open at http://localhost:5173)...
call pnpm run dev:auto-form-app

pause
