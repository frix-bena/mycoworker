# 📚 Activity Tracker - Complete Documentation Index

Welcome to the **PC Activity Tracker** - an AI-powered system that monitors your daily coding and music listening activities with comprehensive analytics.

## 🎯 Getting Started

Start here if you're new to Activity Tracker:

1. **[QUICK_START.md](QUICK_START.md)** ⚡
   - 5-minute setup guide
   - Installation steps
   - First run instructions
   - Basic troubleshooting

2. **[CHECKLIST.md](CHECKLIST.md)** ✅
   - Pre-flight checks
   - Installation checklist
   - Verification steps
   - Daily usage guide

## 📖 Main Documentation

### [README.md](README.md)
**Complete feature documentation and reference**
- Full feature list
- System requirements
- Project structure
- Configuration guide
- Database schema
- Activity detection logic
- Dashboard features
- Troubleshooting guide
- FAQ section

### [ARCHITECTURE.md](ARCHITECTURE.md)
**Technical architecture and system design**
- System architecture diagram
- Data flow visualization
- Module responsibilities
- Technology stack
- Deployment architecture
- Security & privacy model
- Performance metrics
- Development guidelines

## 🛠️ Core Components

### Source Code Files

```
Core Service
├── monitor.py          - Real-time activity monitoring service
├── detector.py         - AI activity classification engine
├── database.py         - Data persistence layer
└── service.py          - Service wrapper and daemon

Web Dashboard
├── dashboard.py        - Streamlit web interface with charts

Configuration & Setup
├── config.py           - Centralized configuration
├── setup.py            - Installation and initialization
└── requirements.txt    - Python dependencies

Utilities & Scripts
├── test_setup.py       - System verification tests
├── start_monitor.bat   - Windows monitor launcher
├── start_dashboard.bat - Windows dashboard launcher
├── start_monitor.sh    - Linux/macOS monitor launcher
└── start_dashboard.sh  - Linux/macOS dashboard launcher
```

## 🚀 Quick Start Paths

### I want to...

#### ...Get it running immediately
1. Read: [QUICK_START.md](QUICK_START.md)
2. Run: `python setup.py`
3. Run: `python service.py` (in terminal 1)
4. Run: `streamlit run dashboard.py` (in terminal 2)

#### ...Understand how it works
1. Read: [README.md](README.md) - Features section
2. Read: [ARCHITECTURE.md](ARCHITECTURE.md) - System overview
3. Check: [config.py](config.py) - See app categories

#### ...Customize the system
1. Read: [README.md](README.md) - Configuration section
2. Edit: [config.py](config.py) - Add apps and settings
3. Restart monitor and dashboard

#### ...Troubleshoot issues
1. Run: `python test_setup.py`
2. Check: [README.md](README.md) - Troubleshooting section
3. View: `data/logs/activity_tracker.log`

#### ...Extend with new features
1. Read: [ARCHITECTURE.md](ARCHITECTURE.md) - Development section
2. Edit: Relevant source files
3. Test with: `python test_setup.py`

## 📊 Feature Overview

### Monitoring Capabilities
- ✅ Detects active application changes (every 5 seconds)
- ✅ Monitors keyboard activity (continuous)
- ✅ Categorizes activities (Coding, Music, Other)
- ✅ Calculates session duration
- ✅ Stores all data locally
- ✅ Maintains activity history

### Dashboard Features
- ✅ Real-time activity summary
- ✅ Interactive charts and visualizations
- ✅ Daily and weekly breakdowns
- ✅ Top applications ranking
- ✅ Flexible time period selection
- ✅ Responsive web interface

### AI Detection
- ✅ Keyword matching for apps
- ✅ Pattern recognition from history
- ✅ Keyboard activity boost
- ✅ Confidence scoring (0.0-1.0)
- ✅ Context-aware classification

## 🔧 Configuration Guide

### What You Can Configure

| Setting | File | Default | Purpose |
|---------|------|---------|---------|
| Monitor Interval | config.py | 5 sec | How often to check active window |
| Keyboard Timeout | config.py | 30 sec | How long before activity is idle |
| Coding Apps | config.py | Many | Applications to detect as coding |
| Music Apps | config.py | Many | Applications to detect as music |
| Data Retention | config.py | 90 days | How long to keep data |
| Dashboard Port | config.py | 8501 | Web interface port |

See [README.md - Configuration](README.md#🔧-configuration) for details.

## 📊 Data & Privacy

### Where is my data stored?
- **Database**: `data/activity_tracker.db`
- **Logs**: `data/logs/activity_tracker.log`
- **Both**: Local on your computer only

### Is my data private?
- ✅ All data stored locally
- ✅ No internet connection required
- ✅ No external services used
- ✅ You can inspect/delete anytime

See [ARCHITECTURE.md - Security](ARCHITECTURE.md#security--privacy-model) for details.

## 🧪 Testing & Verification

### Verify Installation
```bash
python test_setup.py
```

This checks:
- Python version
- All dependencies
- Database initialization
- Detector functionality
- Monitor startup

### Generate Sample Data
1. Start monitor
2. Open VS Code (or IDE)
3. Do some coding for 30+ seconds
4. Open Spotify (or music app)
5. Listen to music for 30+ seconds
6. Refresh dashboard

## 📈 Dashboard Guide

### View Your Stats
1. Open http://localhost:8501
2. See today's activity by default
3. Use sidebar to select time period
4. View charts and tables

### Metric Cards
- **Coding Time**: Total time in coding applications
- **Music Time**: Total time in music applications
- **Other Activities**: Time in other applications
- **Total Active Time**: Sum of all active time

### Charts
- **Pie Chart**: Activity distribution percentage
- **Timeline**: Hour-by-hour activity log
- **Daily Breakdown**: Multi-day comparison (stacked bar)
- **Top Applications**: Most-used apps table

## 🔄 Regular Maintenance

### Daily
- Start monitor service
- Start dashboard
- Work normally (monitoring happens automatically)

### Weekly
- Review dashboard for trends
- Add new apps to config if needed
- Check logs for errors

### Monthly
- Verify accurate categorization
- Adjust confidence thresholds if needed
- Review data storage usage

### Quarterly
- Clean up old data (auto-delete older than 90 days)
- Update dependencies
- Backup important insights

## 🆘 Getting Help

### Documentation
1. **Quick questions**: Check [README.md - FAQ](README.md#❓-faq)
2. **Setup issues**: Check [QUICK_START.md](QUICK_START.md)
3. **Technical details**: Check [ARCHITECTURE.md](ARCHITECTURE.md)
4. **All problems**: Check [README.md - Troubleshooting](README.md#🐛-troubleshooting)

### Diagnostics
1. Run: `python test_setup.py`
2. View: `data/logs/activity_tracker.log`
3. Check: `data/activity_tracker.db` (SQLite browser)

### Common Issues
| Issue | Solution |
|-------|----------|
| No data in dashboard | Check monitor is running, wait 30 seconds, refresh |
| Dashboard won't load | Check port 8501 is available, check monitor is running |
| App not detected | Add to config.py, restart monitor |
| Performance issues | Check system resources, reduce monitor interval |

## 📚 Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| [QUICK_START.md](QUICK_START.md) | Quick setup guide | 5 min |
| [README.md](README.md) | Complete reference | 15 min |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical design | 10 min |
| [CHECKLIST.md](CHECKLIST.md) | Installation checklist | 3 min |
| [INDEX.md](INDEX.md) | This file - navigation | 5 min |

## 🎓 Learning Path

### Beginner (Just want to use it)
1. Read: [QUICK_START.md](QUICK_START.md)
2. Run: `python setup.py`
3. Run: `python service.py`
4. Run: `streamlit run dashboard.py`

### Intermediate (Want to customize)
1. Read: [README.md](README.md)
2. Read: [QUICK_START.md](QUICK_START.md)
3. Edit: [config.py](config.py)
4. Restart services

### Advanced (Want to understand/extend)
1. Read: [ARCHITECTURE.md](ARCHITECTURE.md)
2. Read: [README.md](README.md)
3. Study: Source code files
4. Modify and test

## 🚀 Next Steps

### First Time Users
- [ ] Read [QUICK_START.md](QUICK_START.md)
- [ ] Run `python setup.py`
- [ ] Start monitor and dashboard
- [ ] Generate sample data
- [ ] Check dashboard results

### Existing Users
- [ ] Check [README.md](README.md) for features
- [ ] Customize in [config.py](config.py)
- [ ] Review dashboard regularly
- [ ] Check [CHECKLIST.md](CHECKLIST.md) for maintenance

### Developers
- [ ] Study [ARCHITECTURE.md](ARCHITECTURE.md)
- [ ] Review source code
- [ ] Run `python test_setup.py`
- [ ] Make improvements
- [ ] Test thoroughly

## 📞 Support Resources

- **Installation**: [QUICK_START.md](QUICK_START.md)
- **Features**: [README.md](README.md)
- **Troubleshooting**: [README.md#Troubleshooting](README.md#🐛-troubleshooting)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Testing**: `python test_setup.py`
- **Logs**: `data/logs/activity_tracker.log`

## 📋 Document Summary

```
📚 Complete Documentation
├── 📖 README.md (Full reference - 400+ lines)
│   ├── Features & Setup
│   ├── Configuration Guide
│   ├── Dashboard Guide
│   ├── Troubleshooting
│   └── FAQ
│
├── ⚡ QUICK_START.md (Quick setup - 150+ lines)
│   ├── Installation Steps
│   ├── Running the System
│   ├── First Run Tips
│   └── Common Issues
│
├── ✅ CHECKLIST.md (Setup checklist - 100+ lines)
│   ├── Pre-flight Checks
│   ├── Installation Steps
│   ├── First Run Verification
│   └── Customization
│
├── 🏗️ ARCHITECTURE.md (Technical guide - 500+ lines)
│   ├── System Diagrams
│   ├── Module Details
│   ├── Technology Stack
│   ├── Security Model
│   └── Development Guide
│
└── 📚 INDEX.md (This file - Navigation guide)
    ├── Quick Start Paths
    ├── Feature Overview
    ├── Troubleshooting
    └── Learning Paths
```

---

## Quick Links

**Get Started**: [QUICK_START.md](QUICK_START.md)  
**Full Reference**: [README.md](README.md)  
**Technical Details**: [ARCHITECTURE.md](ARCHITECTURE.md)  
**Setup Checklist**: [CHECKLIST.md](CHECKLIST.md)

---

**Activity Tracker - Monitor. Analyze. Improve. 📊**

*Last Updated: February 2024*  
*Version: 1.0*
