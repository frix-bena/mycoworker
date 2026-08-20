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
    'antigravity': 'Antigravity IDE',
    'vscode': 'Visual Studio Code',
    'visual studio code': 'Visual Studio Code',
    'code': 'Visual Studio Code',
    'code-oss': 'Visual Studio Code',
    'vscodium': 'VSCodium',
    'cursor': 'Cursor',
    'windsurf': 'Windsurf',
    'positron': 'Positron',
    'zed': 'Zed',
    'pycharm': 'PyCharm',
    'intellij': 'IntelliJ IDEA',
    'webstorm': 'WebStorm',
    'clion': 'CLion',
    'rider': 'JetBrains Rider',
    'goland': 'GoLand',
    'android studio': 'Android Studio',
    'androidstudio': 'Android Studio',
    'phpstorm': 'PhpStorm',
    'rubymine': 'RubyMine',
    'rustrover': 'RustRover',
    'datagrip': 'DataGrip',
    'fleet': 'JetBrains Fleet',
    'jetbrains': 'JetBrains IDEs',
    'visual studio': 'Visual Studio',
    'sublime': 'Sublime Text',
    'sublime text': 'Sublime Text',
    'atom': 'Atom',
    'notepad++': 'Notepad++',
    'neovim': 'Neovim',
    'nvim': 'Neovim',
    'vim': 'Vim',
    'gvim': 'Vim',
    'emacs': 'Emacs',
    'eclipse': 'Eclipse',
    'terminal': 'Terminal',
    'ptyxis': 'Ptyxis Terminal',
    'alacritty': 'Alacritty',
    'kitty': 'Kitty Terminal',
    'wezterm': 'WezTerm',
    'powershell': 'PowerShell',
    'cmd': 'Command Prompt',
    'bash': 'Bash Terminal',
    'zsh': 'Zsh Terminal',
    'git': 'Git',
    'github desktop': 'GitHub Desktop',
}

MUSIC_APPS = {
    'spotify': 'Spotify',
    'youtube music': 'YouTube Music',
    'youtube': 'YouTube',
    'vlc': 'VLC Media Player',
    'amberol': 'Amberol',
    'rhythmbox': 'Rhythmbox',
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
    'deezer': 'Deezer',
    'podcast': 'Podcast',
}

OTHER_APPS = {
    'brave': 'Brave Browser',
    'chrome': 'Google Chrome',
    'google chrome': 'Google Chrome',
    'firefox': 'Mozilla Firefox',
    'zen': 'Zen Browser',
    'chromium': 'Chromium',
    'claude': 'Claude Desktop',
    'chatgpt': 'ChatGPT',
    'browser': 'Web Browsing',
    'email': 'Email',
    'thunderbird': 'Thunderbird',
    'slack': 'Slack',
    'discord': 'Discord',
    'notion': 'Notion',
    'obsidian': 'Obsidian',
    'figma': 'Figma',
    'teams': 'Microsoft Teams',
    'zoom': 'Zoom',
    'skype': 'Skype',
}

# Dashboard
DASHBOARD_HOST = "127.0.0.1"
DASHBOARD_PORT = 8501

# Data retention (days)
DATA_RETENTION_DAYS = 90
