@echo off
REM Startup script for AdaptiveLearnAI with Quiz Platform integration

echo.
echo 🚀 Starting AdaptiveLearnAI with Quiz Platform...
echo.

REM Check MongoDB
echo Checking MongoDB connection...
REM Note: This is a simple check, you may need to adjust for your setup
if not exist "C:\Program Files\MongoDB\Server\*" (
    if not exist "%PROGRAMFILES%\MongoDB\Server\*" (
        echo ⚠️  MongoDB may not be running
        echo Please ensure MongoDB is running before continuing
        echo Options:
        echo   • Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest
        echo   • Local: mongod
        pause
    )
)
echo ✓ Proceeding...
echo.

REM Start Python service in new window
echo Starting Python Quiz Platform Service...
start "Python Quiz Platform" cmd /k "cd python-services\quiz_platform && if not exist venv python -m venv venv && call venv\Scripts\activate && pip install -r requirements.txt && python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000"
timeout /t 3

REM Start Next.js in new window
echo Starting Next.js Application...
start "AdaptiveLearnAI" cmd /k "npm run dev"

echo.
echo ==========================================
echo ✅ Services are starting...
echo ==========================================
echo.
echo 🌐 Application URLs:
echo    • Next.js:      http://localhost:9002
echo    • Python API:   http://localhost:8000
echo    • API Docs:     http://localhost:8000/docs
echo.
echo 📝 Check the terminal windows for startup messages
echo.
