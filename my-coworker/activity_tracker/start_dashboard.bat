@echo off
REM Activity Tracker - Launch Dashboard
REM This script starts the Streamlit web dashboard

echo.
echo ========================================
echo Activity Tracker - Dashboard
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

echo Starting Dashboard...
echo.
echo The dashboard will open in your default browser at: http://localhost:8501
echo Press Ctrl+C to stop the dashboard.
echo.

python -m streamlit run dashboard.py --logger.level=warning

pause
