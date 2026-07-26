@echo off
REM Activity Tracker - Start Monitor Service
REM This script starts the background activity monitoring service

echo.
echo ========================================
echo Activity Tracker - Monitor Service
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to PATH
    pause
    exit /b 1
)

REM Check if dependencies are installed
python -c "import streamlit" >nul 2>&1
if errorlevel 1 (
    echo Dependencies not found. Running setup...
    python setup.py
    if errorlevel 1 (
        echo Setup failed. Please run setup.py manually.
        pause
        exit /b 1
    )
)

echo Starting Activity Monitor Service...
echo.
echo The monitor will run in the background and track your activities.
echo Press Ctrl+C to stop the service.
echo.

python service.py

pause
