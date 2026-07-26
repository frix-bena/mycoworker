#!/bin/bash
# Activity Tracker - Start Monitor Service
# This script starts the background activity monitoring service

echo ""
echo "========================================"
echo "Activity Tracker - Monitor Service"
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

echo "Starting Activity Monitor Service..."
echo ""
echo "The monitor will run in the background and track your activities."
echo "Press Ctrl+C to stop the service."
echo ""

python3 service.py
