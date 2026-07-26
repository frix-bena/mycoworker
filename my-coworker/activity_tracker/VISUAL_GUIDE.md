# 🎨 Activity Tracker - Visual Setup Guide

## Installation Flow

```
START
  ↓
┌─────────────────────────────────────────┐
│  Do you have Python 3.8+ installed?     │
└─────────────────────────────────────────┘
  ├─ NO → Install from python.org
  │        (Check "Add to PATH")
  │
  └─ YES ↓
    ┌─────────────────────────────────────────┐
    │  Open Command Prompt                     │
    │  (Win+R → cmd → Enter)                   │
    └─────────────────────────────────────────┘
      ↓
    ┌─────────────────────────────────────────┐
    │  cd C:\Users\YourName\OneDrive\Desktop\  │
    │  mycoworker\activity_tracker             │
    └─────────────────────────────────────────┘
      ↓
    ┌─────────────────────────────────────────┐
    │  python setup.py                         │
    │  (Wait 2-3 minutes)                      │
    └─────────────────────────────────────────┘
      ↓
    ┌─────────────────────────────────────────┐
    │  See "Setup completed successfully!"?   │
    └─────────────────────────────────────────┘
      ├─ NO → Check error message
      │        Run: pip install -r requirements.txt
      │
      └─ YES ↓
        ┌─────────────────────────────────────────┐
        │  Installation Complete! ✓               │
        │  Next: Start the services               │
        └─────────────────────────────────────────┘
          ↓
        END
```

## Running the System

```
┌────────────────────────────────────────────────────┐
│         ACTIVITY TRACKER - RUNNING GUIDE            │
└────────────────────────────────────────────────────┘

┌─ Terminal 1 (Monitor Service) ───────────────────┐
│                                                   │
│  > python service.py                             │
│                                                   │
│  Expected Output:                                │
│  ============================================     │
│  Activity Tracker Service starting at 10:30:45  │
│  Service started successfully                    │
│  Monitor is now tracking your activities...      │
│  [Keep this running in background]              │
│                                                   │
│  Status: ✓ RUNNING                              │
│  ✓ Detecting apps                               │
│  ✓ Monitoring keyboard                          │
│  ✓ Saving data                                  │
│                                                   │
└───────────────────────────────────────────────────┘

┌─ Terminal 2 (Dashboard) ──────────────────────────┐
│                                                   │
│  > streamlit run dashboard.py                    │
│                                                   │
│  Expected Output:                                │
│  ============================================     │
│  You can now view your Streamlit app in         │
│  your browser at:                                │
│  http://localhost:8501                          │
│                                                   │
│  Expected: Browser opens automatically          │
│  [Keep this running - refresh browser anytime]  │
│                                                   │
│  Status: ✓ RUNNING                              │
│  ✓ Dashboard available                          │
│  ✓ Reading data from database                   │
│                                                   │
└───────────────────────────────────────────────────┘
```

## Dashboard Overview

```
┌─────────────────────────────────────────────────────────────┐
│  📊 PC Activity Tracker Dashboard                           │
│  http://localhost:8501                                     │
│─────────────────────────────────────────────────────────────│
│                                                              │
│  SIDEBAR (Left)                         MAIN CONTENT         │
│  ────────────────────                   ────────────────     │
│  🔧 Controls                            📈 Summary           │
│  ├─ Select Time Period                  ├─ Coding Time      │
│  │  ├─ Today                            ├─ Music Time       │
│  │  ├─ Last 7 Days                      ├─ Other Activities │
│  │  ├─ Last 30 Days                     └─ Total Time       │
│  │  └─ Custom                                                │
│  └─ Date Pickers (if Custom)            📊 Visualizations   │
│     ├─ Start Date                       ├─ Pie Chart        │
│     └─ End Date                         │  └─ Activity %    │
│                                         │                    │
│                                         ├─ Timeline Chart    │
│                                         │  └─ Hourly Activity│
│                                         │                    │
│                                         📅 Daily Breakdown   │
│                                         │  └─ Stacked Bar    │
│                                         │                    │
│                                         🖥️ Top Applications  │
│                                         │  └─ Table List    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Activity Detection Flow

```
┌──────────────────┐
│  User Activity   │
│  (Using PC)      │
└────────┬─────────┘
         │
         ↓
    ┌────────────────────────────────────┐
    │  Monitor Checks (Every 5 seconds)   │
    ├────────────────────────────────────┤
    │  • Active window title              │
    │  • Application name                 │
    │  • Window class                     │
    │  • Idle time                        │
    └────────┬───────────────────────────┘
             │
             ↓
    ┌────────────────────────────────────┐
    │  Keyboard Listener (Continuous)     │
    ├────────────────────────────────────┤
    │  • Key press detected?              │
    │  • Update activity status           │
    │  • Timestamp events                 │
    └────────┬───────────────────────────┘
             │
             ↓
    ┌────────────────────────────────────┐
    │  Smart Detector Analyzes            │
    ├────────────────────────────────────┤
    │  1. Keyword Matching                │
    │     • "Code" → Coding              │
    │     • "Spotify" → Music            │
    │     • "Chrome" → Other             │
    │                                     │
    │  2. Pattern Recognition             │
    │     • History check                │
    │     • Consistency boost            │
    │                                     │
    │  3. Confidence Scoring              │
    │     • Base score (keyword)          │
    │     • Keyboard boost                │
    │     • Pattern boost                │
    │     • Final: 0.0-1.0                │
    │                                     │
    │  Result: (Category, App, Score)   │
    └────────┬───────────────────────────┘
             │
             ↓
    ┌────────────────────────────────────┐
    │  Database Stores                    │
    ├────────────────────────────────────┤
    │  • Activity record                  │
    │  • Timestamp                        │
    │  • Category (coding/music/other)    │
    │  • Keyboard active flag             │
    │  • Update daily summary             │
    └────────┬───────────────────────────┘
             │
             ↓
    ┌────────────────────────────────────┐
    │  Dashboard Reads & Displays         │
    ├────────────────────────────────────┤
    │  • Charts update                    │
    │  • Metrics refresh                  │
    │  • Tables show top apps             │
    │  • Summaries calculated             │
    └────────────────────────────────────┘
```

## File Organization

```
activity_tracker/
│
├── 📖 START HERE
│   ├── PROJECT_SUMMARY.md ← Overview & next steps
│   └── QUICK_START.md ← 5-min setup
│
├── 📚 FULL DOCUMENTATION
│   ├── INDEX.md ← Navigation hub
│   ├── README.md ← Complete reference
│   ├── ARCHITECTURE.md ← Technical details
│   └── CHECKLIST.md ← Step-by-step
│
├── 🔴 LAUNCH (Windows)
│   ├── start_monitor.bat ← Double-click to run monitor
│   └── start_dashboard.bat ← Double-click to open dashboard
│
├── 🟢 LAUNCH (Linux/Mac)
│   ├── start_monitor.sh
│   └── start_dashboard.sh
│
├── ⚙️ CORE APPLICATION
│   ├── monitor.py ← Activity monitoring
│   ├── detector.py ← AI classification
│   ├── database.py ← Data storage
│   ├── dashboard.py ← Web interface
│   ├── service.py ← Service wrapper
│   └── config.py ← Configuration
│
├── 🛠️ SETUP & TOOLS
│   ├── setup.py ← Install dependencies
│   ├── test_setup.py ← Verify installation
│   └── generate_sample_data.py ← Create test data
│
├── 📦 DEPENDENCIES
│   └── requirements.txt ← Python packages
│
└── 📊 DATA (auto-created)
    └── data/
        ├── activity_tracker.db ← Your data
        └── logs/
            └── activity_tracker.log ← Debug logs
```

## Quick Command Reference

```
┌──────────────────────────────────────────────────────┐
│         COMMAND QUICK REFERENCE                      │
└──────────────────────────────────────────────────────┘

FIRST TIME SETUP
  > python setup.py
  └─ Installs all packages

VERIFY INSTALLATION
  > python test_setup.py
  └─ Checks everything is working

START SERVICES (Terminal 1)
  > python service.py
  └─ Starts background monitor

VIEW DASHBOARD (Terminal 2)
  > streamlit run dashboard.py
  └─ Opens web interface at http://localhost:8501

GENERATE TEST DATA
  > python generate_sample_data.py generate 7
  └─ Creates 7 days of sample data

CLEAR DATA
  > python generate_sample_data.py clear
  └─ Deletes all activity data

VIEW LOGS
  Windows:
    > type data\logs\activity_tracker.log
  
  Linux/Mac:
    $ tail -f data/logs/activity_tracker.log
```

## Activity Categories

```
┌─────────────────────────────────────────────────────┐
│  DETECTED ACTIVITIES                                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  💻 CODING                                          │
│  ├─ Visual Studio Code                             │
│  ├─ PyCharm / JetBrains IDEs                       │
│  ├─ Visual Studio                                  │
│  ├─ Sublime Text                                   │
│  ├─ Atom                                           │
│  ├─ Command Prompt / PowerShell / Terminal         │
│  └─ ... (50+ coding tools)                         │
│                                                      │
│  🎵 MUSIC                                           │
│  ├─ Spotify                                        │
│  ├─ YouTube                                        │
│  ├─ VLC Media Player                               │
│  ├─ Winamp                                         │
│  ├─ iTunes / Apple Music                           │
│  ├─ Tidal                                          │
│  └─ ... (10+ music services)                       │
│                                                      │
│  📱 OTHER                                           │
│  ├─ Web Browsers                                   │
│  ├─ Email Clients                                  │
│  ├─ Chat Apps (Slack, Teams)                       │
│  ├─ Video Calls (Zoom, Skype)                      │
│  └─ ... and everything else                        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Keyboard Activity Detection

```
┌──────────────────────────────────┐
│  KEYBOARD MONITORING             │
├──────────────────────────────────┤
│                                   │
│  Detects:                        │
│  ✓ Key press events              │
│  ✓ Typing activity               │
│  ✓ Continuous keyboard input     │
│                                   │
│  Used for:                       │
│  → Boost "Coding" confidence     │
│  → Detect when you stop typing   │
│  → Mark activity as "active"     │
│                                   │
│  Does NOT:                       │
│  ✗ Record what you type          │
│  ✗ Store keyboard input          │
│  ✗ See your passwords            │
│  ✗ Send anywhere                 │
│                                   │
│  Privacy:                        │
│  ✓ Only detects key press TIME   │
│  ✓ Completely local              │
│  ✓ No content stored             │
│                                   │
└──────────────────────────────────┘
```

## Dashboard Metrics Explained

```
┌────────────────────────────────────────────┐
│  DASHBOARD METRICS                         │
├────────────────────────────────────────────┤
│                                             │
│  📝 CODING TIME                             │
│  └─ Total hours in coding applications     │
│     Shows focus on development work        │
│                                             │
│  🎵 MUSIC TIME                              │
│  └─ Total hours listening to music/audio   │
│     Shows your relaxation/focus music      │
│                                             │
│  📋 OTHER ACTIVITIES                        │
│  └─ Everything else (browsing, chat, etc.) │
│     Shows non-focused time                 │
│                                             │
│  ⏰ TOTAL ACTIVE TIME                       │
│  └─ Sum of all above                       │
│     Shows total productive time            │
│                                             │
│  📊 PIE CHART                               │
│  └─ Percentage breakdown                   │
│     Visual activity distribution           │
│                                             │
│  📈 TIMELINE CHART                          │
│  └─ Hour-by-hour activity                  │
│     See your hourly patterns               │
│                                             │
│  📅 DAILY BREAKDOWN                         │
│  └─ Day-by-day comparison                  │
│     Track trends over time                 │
│                                             │
│  🖥️ TOP APPS TABLE                          │
│  └─ Most-used applications                 │
│     See which apps you use most            │
│                                             │
└────────────────────────────────────────────┘
```

## Troubleshooting Visual Guide

```
❌ PROBLEM                    ✅ SOLUTION
─────────────────────────────────────────────────
No data in dashboard    →    1. Check monitor running
                            2. Wait 30 seconds
                            3. Refresh browser

Dashboard won't load   →    1. Check port 8501 free
                            2. Check monitor running
                            3. Restart dashboard

App not detected       →    1. Add to config.py
                            2. Restart monitor
                            3. Test again

Python not found       →    1. Install Python 3.8+
                            2. Add to PATH
                            3. Restart terminal

Dependencies fail      →    1. Upgrade pip
                            2. Run setup.py again
                            3. Check internet connection

Monitor crashes        →    1. Check logs
                            2. Check Python version
                            3. Verify dependencies
```

---

**Ready to start? → Read [QUICK_START.md](QUICK_START.md)**
