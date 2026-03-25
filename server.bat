@echo off
setlocal

:: Check if port 5173 is in use
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    set PID=%%a
)

if defined PID (
    echo Stopping dev server (PID: %PID%)...
    taskkill /PID %PID% /F >nul 2>&1
    echo Server stopped.
) else (
    echo Starting dev server...
    cd /d "%~dp0"
    start /B cmd /c "npm run dev > .server.log 2>&1"
    timeout /t 2 /nobreak >nul
    echo Server started on http://localhost:5173
    echo Log file: .server.log
)

endlocal
