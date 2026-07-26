#!/bin/bash
# Activity Tracker - Launch Dashboard
# This script starts the Streamlit web dashboard

echo ""
echo "========================================"
echo "Activity Tracker - Dashboard"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.8+"
    exit 1
fi

# Check if dependencies are installed
python3 -c "import streamlit" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Dependencies not found. Running setup..."
    python3 setup.py
    if [ $? -ne 0 ]; then
        echo "Setup failed. Please run setup.py manually."
        exit 1
    fi
fi

echo "Starting Dashboard..."
echo ""
echo "The dashboard will open in your default browser at: http://localhost:8501"
echo "Press Ctrl+C to stop the dashboard."
echo ""

python3 -m streamlit run dashboard.py --logger.level=warning
