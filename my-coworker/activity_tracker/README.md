# 📊 Activity Tracker - PC Activity Monitoring System

A sophisticated AI-powered activity tracking system that monitors your daily coding and music listening activities with an interactive web dashboard.

## 🎯 Features

- **Real-time Activity Monitoring**: Tracks active applications and keyboard activity every 5 seconds
- **Smart Detection**: AI-enhanced activity classification for Coding, Music, and Other activities
- **Keyboard Activity Detection**: Monitors keyboard usage to detect active coding sessions
- **Comprehensive Database**: SQLite database storing all activity data with proper indexing
- **Interactive Dashboard**: Streamlit-based web dashboard with rich visualizations
- **Daily & Weekly Summaries**: Automatically aggregates activity data for easy trend analysis
- **Top Applications**: Shows your most-used applications with time spent
- **Flexible Time Ranges**: View data for Today, Last 7 Days, Last 30 Days, or Custom Range

## 📋 System Requirements

- **Operating System**: Windows 7+ (primary support), Linux/macOS (partial support)
- **Python**: 3.8 or higher
- **RAM**: 512 MB minimum
- **Disk Space**: ~10 MB for installation and initial database

## 🚀 Quick Start

### 1. Installation

```bash
cd activity_tracker
python setup.py
```

This will:
- Verify Python version
- Install all required dependencies
- Initialize the database

### 2. Start Monitoring

**On Windows:**
```bash
start_monitor.bat
```

**On Linux/macOS:**
```bash
bash start_monitor.sh
```

**Or directly:**
```bash
python service.py
```

### 3. View Dashboard

In a new terminal, start the dashboard:

**On Windows:**
```bash
start_dashboard.bat
```

**On Linux/macOS:**
```bash
bash start_dashboard.sh
```

**Or directly:**
```bash
streamlit run dashboard.py
```

The dashboard will open at `http://localhost:8501`

## 📁 Project Structure

```
activity_tracker/
├── config.py              # Configuration and app categories
├── database.py            # SQLite database operations
├── detector.py            # AI activity detection logic
├── monitor.py             # Main monitoring service
├── service.py             # Service wrapper
├── dashboard.py           # Streamlit web dashboard
├── setup.py               # Setup and dependency installer
├── requirements.txt       # Python dependencies
├── data/                  # Data directory
│   ├── activity_tracker.db    # SQLite database
│   └── logs/                  # Log files
├── start_monitor.bat      # Windows monitor launcher
├── start_monitor.sh       # Linux/macOS monitor launcher
├── start_dashboard.bat    # Windows dashboard launcher
├── start_dashboard.sh     # Linux/macOS dashboard launcher
└── README.md             # This file
```

## 🔧 Configuration

Edit `config.py` to customize:

### Monitoring Intervals
```python
MONITOR_INTERVAL = 5        # Check active window every 5 seconds
KEYBOARD_TIMEOUT = 30       # Consider activity stopped after 30 seconds
```

### Application Categories
Add or modify application keywords for detection:

```python
CODING_APPS = {
    'vscode': 'Visual Studio Code',
    'pycharm': 'PyCharm',
    # ... add more as needed
}

MUSIC_APPS = {
    'spotify': 'Spotify',
    'youtube': 'YouTube',
    # ... add more as needed
}
```

### Data Retention
```python
DATA_RETENTION_DAYS = 90    # Keep data for 90 days
```

## 💾 Database Schema

### activities table
- `id`: Primary key
- `timestamp`: When the activity occurred
- `app_name`: Application executable name
- `window_title`: Active window title
- `category`: Activity category (coding, music, other)
- `keyboard_active`: Whether keyboard was active
- `duration_seconds`: How long the activity lasted

### daily_summary table
- `id`: Primary key
- `date`: Date of summary
- `coding_seconds`: Time spent coding
- `music_seconds`: Time spent listening to music
- `other_seconds`: Time spent on other activities
- `total_active_seconds`: Total active time

### sessions table
- Grouped activity sessions with detailed information

## 🤖 Activity Detection Logic

The system uses a multi-layered approach for detecting activities:

### 1. **Keyword Matching**
Analyzes application name and window title against known patterns for:
- Coding IDEs (VS Code, PyCharm, Visual Studio, etc.)
- Music apps (Spotify, YouTube, VLC, etc.)
- Other applications

### 2. **Keyboard Activity**
Monitors keyboard input to enhance detection:
- Coding activity gets boosted confidence when keyboard is active
- Idle time is detected when no keyboard input for 30+ seconds

### 3. **Pattern Recognition**
Learns from history:
- Increases confidence for repeatedly used applications
- Recognizes consistent usage patterns

### 4. **Context Analysis**
Considers:
- Previous activity category
- Time since last activity
- Application-specific heuristics

## 📊 Dashboard Features

### Summary Metrics
- Total coding time
- Total music listening time
- Total other activities time
- Overall active time

### Visualizations
1. **Pie Chart**: Activity distribution as a percentage
2. **Timeline Chart**: Hour-by-hour activity log
3. **Daily Breakdown**: Stacked bar chart showing daily activity
4. **Top Applications**: Table of most-used apps with time spent

### Time Period Selection
- **Today**: Current day only
- **Last 7 Days**: Past week (6 days + today)
- **Last 30 Days**: Past month (29 days + today)
- **Custom**: Choose any date range

## 📝 Log Files

Logs are stored in `data/logs/activity_tracker.log`

View recent logs:
```bash
# Windows
type data\logs\activity_tracker.log

# Linux/macOS
tail -f data/logs/activity_tracker.log
```

## 🔒 Privacy & Security

- **Local Storage**: All data is stored locally on your machine
- **No Cloud**: No data is sent to external servers
- **Transparent**: You can inspect the database and logs anytime
- **Customizable**: You control what categories and apps are tracked

## ⚙️ Advanced Usage

### Running Multiple Instances
You can run the monitor and dashboard simultaneously:
- Monitor runs in background continuously collecting data
- Dashboard refreshes data from database every time you view it

### Data Cleanup
Clear data older than 90 days:
```python
from database import ActivityDatabase
db = ActivityDatabase()
db.clear_old_data(days=90)
```

### Custom Activity Categories
Extend the detector with your own categories:

```python
# In config.py, add new category
CUSTOM_APPS = {
    'myapp': 'My Application',
}

# In detector.py, update SmartActivityClassifier
```

### Direct Database Access
```python
from database import ActivityDatabase
db = ActivityDatabase()

# Get activities for a date range
activities = db.get_activities('2024-01-01', '2024-01-31')

# Get daily summary
summary = db.get_daily_summary('2024-01-15')
```

## 🐛 Troubleshooting

### Monitor not detecting activities
1. Check if `pynput` is properly installed: `pip install pynput`
2. On Windows, some applications may be elevated (admin mode) - UAC restrictions apply
3. Check logs: `type data\logs\activity_tracker.log`

### Dashboard not loading
1. Ensure the monitor has run for at least 5 seconds to create data
2. Check if port 8501 is available
3. Try accessing http://localhost:8501

### Dependencies installation fails
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Try installing individually
pip install streamlit plotly pandas psutil pynput
```

### Database errors
Delete the database and let it reinitialize:
```bash
# Windows
del data\activity_tracker.db

# Linux/macOS
rm data/activity_tracker.db
```

Then restart the monitor.

## 📈 Tips for Accurate Tracking

1. **Keep monitor running**: Leave the monitor service running in the background
2. **Don't close IDE frequently**: Activity is recorded when window changes
3. **Use consistent app titles**: Some apps change window titles frequently
4. **Review & adjust**: Check dashboard regularly and adjust app categories as needed

## 🔄 Auto-start (Windows)

Create a batch file in your Startup folder:

```batch
@echo off
cd C:\Users\YourUsername\OneDrive\Desktop\mycoworker\activity_tracker
python service.py
```

Save to: `C:\Users\YourUsername\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\`

## 📚 Dependencies

- **streamlit**: Web dashboard framework
- **plotly**: Interactive charting library
- **pandas**: Data manipulation
- **psutil**: System process monitoring
- **pynput**: Keyboard monitoring
- **python-dotenv**: Environment variable management

## 🤝 Contributing

To extend the system:

1. Add new app keywords to `config.py`
2. Enhance detection logic in `detector.py`
3. Add new dashboard charts in `dashboard.py`
4. Create new database queries in `database.py`

## 📜 License

This project is provided as-is for personal use.

## ❓ FAQ

**Q: Does this work on macOS/Linux?**
A: Partially. The keyboard listener and window detection work on all platforms, but some Windows-specific APIs may not be available.

**Q: Can I export the data?**
A: Yes, you can access the SQLite database directly or export from dashboard using pandas.

**Q: What if I want to track other activities?**
A: Edit `config.py` to add your own app categories and keywords.

**Q: Is this a resource hog?**
A: No, it uses minimal CPU and memory (~20-50 MB RAM, <1% CPU typically).

**Q: Can I delete old data?**
A: Yes, use `db.clear_old_data(days=90)` or delete `data/activity_tracker.db` to start fresh.

## 🚨 System Permissions

On Windows, the application requires:
- Read-only access to active window information
- Keyboard event monitoring
- File system access for database

No elevated permissions are required for normal operation.

---

**Made with ❤️ for tracking your productivity**
