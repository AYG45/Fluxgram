@echo off
echo ========================================
echo Starting Fluxgram Development Servers
echo ========================================
echo.

echo Checking if MongoDB is running...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is running
) else (
    echo [WARNING] MongoDB is not running!
    echo Please start MongoDB before continuing.
    echo Run: mongod
    pause
    exit /b 1
)

echo.
echo Starting Backend Server...
start "Fluxgram Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
start "Fluxgram Frontend" cmd /k "cd fluxgram && npm start"

echo.
echo ========================================
echo Servers are starting...
echo ========================================
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:4200
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
