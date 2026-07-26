# 📋 Installation & First Run Checklist

## Pre-Flight Checks ✅

- [ ] Python 3.8+ installed (check: `python --version`)
- [ ] You're in the `activity_tracker` directory
- [ ] You have internet connection (for package downloads)
- [ ] Disk space available (at least 50 MB)

## Installation

- [ ] Run `python setup.py` in the terminal
- [ ] Wait for all dependencies to install
- [ ] See "Setup completed successfully!" message

## First Run

### Start Monitor Service
- [ ] Open a new terminal/command prompt
- [ ] Navigate to activity_tracker folder
- [ ] Run `python service.py`
- [ ] You should see "Service started successfully"
- [ ] Monitor will start tracking in background
- [ ] Leave this terminal running

### Start Dashboard
- [ ] Open another terminal/command prompt
- [ ] Navigate to activity_tracker folder
- [ ] Run `streamlit run dashboard.py`
- [ ] Dashboard will automatically open in browser
- [ ] If not, visit: http://localhost:8501

### Generate Sample Data
- [ ] Open VS Code or another IDE
- [ ] Do some coding (let monitor run for 30+ seconds)
- [ ] Open Spotify or YouTube
- [ ] Listen to music (let monitor run for 30+ seconds)
- [ ] Go back to coding
- [ ] Refresh the dashboard browser page

### View Your Stats
- [ ] See your activities in the dashboard
- [ ] Check the pie chart for activity breakdown
- [ ] View the timeline chart
- [ ] Check "Top Applications" table

## Verify Everything Works

Run the test suite:
```bash
python test_setup.py
```

All tests should show ✓ PASS

## Customize (Optional)

Edit `config.py` to:
- [ ] Add your favorite coding apps
- [ ] Add your favorite music apps
- [ ] Change monitoring interval if desired
- [ ] Adjust keyboard timeout if needed

## Set Up Auto-Start (Optional)

To automatically start monitor on computer startup:

**Windows:**
1. Right-click `start_monitor.bat`
2. Send to → Desktop (create shortcut)
3. Move shortcut to Startup folder:
   `C:\Users\YourUsername\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\`

## Daily Usage

Every day:
1. Open terminal and run `python service.py` (or use batch file)
2. Open another terminal and run `streamlit run dashboard.py` (or use batch file)
3. Work as usual - tracking happens automatically
4. View dashboard to see your activity stats

## Need Help?

- [ ] Check [QUICK_START.md](QUICK_START.md) for quick setup
- [ ] Check [README.md](README.md) for full documentation
- [ ] Check logs: `type data\logs\activity_tracker.log`
- [ ] Run test suite: `python test_setup.py`

---

**Once you complete this checklist, you're all set! 🎉**
