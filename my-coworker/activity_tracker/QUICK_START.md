# 🚀 Quick Start Guide - Activity Tracker

## Installation (First Time Only)

### Step 1: Open Command Prompt
Press `Win + R`, type `cmd`, and press Enter.

### Step 2: Navigate to the Project
```bash
cd C:\Users\YourUsername\OneDrive\Desktop\mycoworker\activity_tracker
```

### Step 3: Run Setup
```bash
python setup.py
```

This will automatically:
- ✓ Check your Python version
- ✓ Install all required packages
- ✓ Initialize the database

## Running the Activity Tracker

### Option A: Use Batch Files (Easiest - Windows Only)

**Terminal 1 - Start the Monitor:**
Double-click `start_monitor.bat`

**Terminal 2 - View Dashboard:**
Double-click `start_dashboard.bat`

The dashboard will automatically open in your browser at http://localhost:8501

### Option B: Manual Command Line

**Terminal 1 - Start the Monitor:**
```bash
python service.py
```

**Terminal 2 - Start Dashboard:**
```bash
streamlit run dashboard.py
```

## What You'll See

### Monitor Service (Terminal 1)
```
Activity Tracker Service starting at 2024-01-26 10:30:45
Service started successfully
Monitor is now tracking your activities...
[INFO] New activity: Visual Studio Code (coding) - Confidence: 0.95
[INFO] New activity: Spotify (music) - Confidence: 0.80
```

### Dashboard (Browser)
The dashboard opens at **http://localhost:8501** with:
- 📊 Activity summary (time spent coding, listening to music, etc.)
- 📈 Charts and visualizations
- 📱 Daily and weekly breakdowns
- 🖥️ Top applications list

## Monitoring Starts Immediately

Once both services are running:
- ✓ Monitor detects when you're coding
- ✓ Monitor detects when you're listening to music
- ✓ Monitor tracks keyboard activity
- ✓ Dashboard updates with real-time data

## View Your Stats

1. **Today's Summary**: Default view shows today's activities
2. **Time Period Selection**: Use the sidebar to select:
   - Today
   - Last 7 Days
   - Last 30 Days
   - Custom Date Range

3. **Charts Show**:
   - Pie chart of activity breakdown
   - Timeline showing hour-by-hour activity
   - Daily breakdown for multiple days
   - Top 10 applications

## Tips for Best Results

1. **Keep Monitor Running**: Leave `start_monitor.bat` running in the background throughout the day

2. **Refresh Dashboard**: Hit refresh in your browser to see latest data

3. **Add Custom Apps**: Edit `config.py` to add applications you use:
   ```python
   CODING_APPS = {
       'myide': 'My IDE Name',  # Add your app here
   }
   ```

4. **Check Logs**: If something seems off, check `data/logs/activity_tracker.log`

## Keyboard Activity Detection

The system automatically detects:
- Active typing (keyboard input)
- Pauses in activity
- Idle time (30+ seconds with no input)

This helps determine if you're **actively coding** vs just having an IDE open.

## Data Storage

All data is stored locally in:
- `data/activity_tracker.db` - Your activity database
- `data/logs/activity_tracker.log` - System logs

**No data is sent anywhere** - it's all on your computer!

## Stopping the Services

### Monitor Service
Click the terminal window and press `Ctrl+C`

### Dashboard
Press `Ctrl+C` in the dashboard terminal, or close the browser tab

## Common Issues & Solutions

### "Python is not recognized"
Install Python from https://python.org and make sure to check "Add to PATH" during installation.

### Dashboard won't load
- Check that `python service.py` is running in another terminal
- Wait 10 seconds for initial data to be collected
- Try refreshing the browser

### No activities showing
- Make sure the monitor has been running for at least 5 seconds
- Check that you're looking at data for "Today" or the correct date range
- Check logs: Look in `data/logs/activity_tracker.log`

### Port 8501 already in use
The dashboard can't start because port 8501 is in use. Either:
1. Close other Streamlit apps
2. Specify a different port: `streamlit run dashboard.py --server.port 8502`

## Next Steps

1. ✓ Run setup.py (if you haven't already)
2. ✓ Start the monitor service
3. ✓ Open the dashboard
4. ✓ Let it run for a bit to collect data
5. ✓ Check your dashboard for insights!

## For More Information

See [README.md](README.md) for:
- Advanced configuration
- Complete feature list
- Troubleshooting guide
- Database schema
- Custom development

---

**Happy tracking! 📊**
