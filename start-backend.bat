@echo off
echo ========================================
echo Starting Fluxgram Backend Server
echo ========================================
echo.

cd backend

echo Checking if MongoDB is running...
net start | find "MongoDB" > nul
if errorlevel 1 (
    echo MongoDB is not running. Starting MongoDB...
    net start MongoDB
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to start MongoDB
        echo Please start MongoDB manually or check if it's installed
        echo.
        pause
        exit /b 1
    )
) else (
    echo MongoDB is already running
)

echo.
echo Starting backend server on http://localhost:3000
echo.
npm run dev
