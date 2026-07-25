<div align="center">

# 📊 Activity Tracker

**A local-first PC activity tracker that shows you where your time actually goes — coding, music, or everything else.**

[![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Dashboard-Streamlit-FF4B4B?logo=streamlit&logoColor=white)](https://streamlit.io/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-Personal%20Use-lightgrey)](#-license)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-informational)](#-system-requirements)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Demo](#-demo)
- [System Requirements](#-system-requirements)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Database Schema](#-database-schema)
- [Privacy](#-privacy)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 About

**Activity Tracker** runs quietly in the background, watches which application window is active, and classifies your time into **Coding**, **Music**, or **Other** — then visualizes it in a clean local dashboard. No accounts, no cloud sync, no external servers. Everything lives in a SQLite database on your own machine.

Built for developers who want an honest picture of how a day actually breaks down.

---

## ✨ Features

| | |
|---|---|
| 🕒 **Real-time monitoring** | Tracks the active app/window every 5 seconds |
| 🧠 **Smart classification** | Pattern-based detection for Coding / Music / Other |
| ⌨️ **Keyboard activity signal** | Boosts confidence when you're actively typing (activity only — never keystroke content) |
| 🗄️ **Local SQLite storage** | Fully offline, fully private |
| 📊 **Interactive dashboard** | Streamlit-powered, with charts and breakdowns |
| 📅 **Flexible time ranges** | Today, Last 7 Days, Last 30 Days, or a custom range |
| 🖥️ **Top applications view** | See exactly which apps eat your time |

---

## 🖼️ Demo

> _Add a screenshot or GIF of your dashboard here once it's running:_
> ```markdown
> ![Dashboard Screenshot](./assets/dashboard-preview.png)
> ```

---

## 🖥️ System Requirements

- **OS:** Windows 7+ (primary support) · Linux/macOS (partial support)
- **Python:** 3.8 or higher
- **RAM:** 512 MB minimum
- **Disk:** ~10 MB

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/frix-bena/mycoworker.git
cd mycoworker/activity_tracker
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the monitor

```bash
# Linux/macOS
bash start_monitor.sh

# Windows
start_monitor.bat

# Or directly
python service.py
```

### 4. Launch the dashboard

In a **separate terminal**:

```bash
# Linux/macOS
bash start_dashboard.sh

# Windows
start_dashboard.bat

# Or directly
streamlit run dashboard.py
```

The dashboard opens automatically at **http://localhost:8501**.

> ⚠️ **Note:** Streamlit apps must be *run*, not opened as static files. Opening `dashboard.py` or the project folder directly in a browser will not work — always launch it with `streamlit run`.

---

## 📁 Project Structure

```
activity_tracker/
├── config.py                  # Configuration and app category definitions
├── database.py                 # SQLite database operations
├── detector.py                  # Activity detection & classification logic
├── monitor.py                    # Core monitoring service
├── service.py                     # Background service wrapper
├── dashboard.py                    # Streamlit web dashboard
├── setup.py                         # Setup and dependency installer
├── test_setup.py                     # System self-test script
├── generate_sample_data.py            # Sample data generator for testing
├── requirements.txt                    # Python dependencies
├── start_monitor.sh / .bat              # Monitor launch scripts
├── start_dashboard.sh / .bat             # Dashboard launch scripts
└── data/                                  # SQLite database + logs (git-ignored)
```

---

## ⚙️ Configuration

Edit `config.py` to customize behavior:

```python
MONITOR_INTERVAL = 5        # Check active window every 5 seconds
KEYBOARD_TIMEOUT = 30       # Consider activity idle after 30s of no input
DATA_RETENTION_DAYS = 90    # How long to keep historical data
```

Add or edit tracked applications:

```python
CODING_APPS = {
    'vscode': 'Visual Studio Code',
    'pycharm': 'PyCharm',
    # add more as needed
}

MUSIC_APPS = {
    'spotify': 'Spotify',
    'youtube': 'YouTube',
    # add more as needed
}
