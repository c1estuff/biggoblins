@echo off
echo Starting local server and tunnel...
echo.

REM Start the Python server in the background
start cmd /c "python -m http.server 8000"

REM Wait a moment for the server to start
timeout /t 2 /nobreak > nul

REM Start ngrok tunnel
ngrok http 8000

REM When ngrok is closed, kill the Python server
taskkill /F /IM python.exe > nul 2>&1