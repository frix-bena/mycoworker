"""Configuration settings for the Activity Tracker."""

import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

# Data directory
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Database
DB_PATH = DATA_DIR / "activity_tracker.db"

# Logging
LOG_DIR = DATA_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "activity_tracker.log"

# Monitoring
MONITOR_INTERVAL = 5  # seconds - check active window every 5 seconds
KEYBOARD_TIMEOUT = 30  # seconds - consider activity stopped after 30 seconds of no keyboard input

# Activity Categories
CODING_APPS = {
    'vscode': 'Visual Studio Code',
    'pycharm': 'PyCharm',
    'jetbrains': 'JetBrains IDEs',
    'visual studio': 'Visual Studio',
    'sublime': 'Sublime Text',
    'atom': 'Atom',
    'notepad++': 'Notepad++',
    'code': 'Code',
    'eclipse': 'Eclipse',
    'intellij': 'IntelliJ',
    'rider': 'JetBrains Rider',
    'terminal': 'Terminal',
    'powershell': 'PowerShell',
    'cmd': 'Command Prompt',
    'git': 'Git',
    'github desktop': 'GitHub Desktop',
}

MUSIC_APPS = {
    'spotify': 'Spotify',
    'youtube': 'YouTube',
    'vlc': 'VLC Media Player',
    'winamp': 'Winamp',
    'media player': 'Windows Media Player',
    'foobar': 'Foobar2000',
    'musicbee': 'MusicBee',
    'itunes': 'iTunes',
    'apple music': 'Apple Music',
    'tidal': 'Tidal',
    'soundcloud': 'SoundCloud',
    'pandora': 'Pandora',
    'audible': 'Audible',
    'discord': 'Discord',
    'mumble': 'Mumble',
}

OTHER_APPS = {
    'browser': 'Web Browsing',
    'email': 'Email',
    'slack': 'Slack',
    'teams': 'Microsoft Teams',
    'zoom': 'Zoom',
    'skype': 'Skype',
}

# Dashboard
DASHBOARD_HOST = "127.0.0.1"
DASHBOARD_PORT = 8501

# Data retention (days)
DATA_RETENTION_DAYS = 90
