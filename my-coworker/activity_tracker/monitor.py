"""Main activity monitoring service."""

import logging
import time
import threading
from datetime import datetime
from pathlib import Path

# Platform-specific imports
import platform

import subprocess
import re

if platform.system() == 'Windows':
    import ctypes
    from ctypes import wintypes
    import psutil
    try:
        from pynput.keyboard import Listener
    except ImportError:
        Listener = None
else:
    try:
        import psutil
    except ImportError:
        psutil = None
    Listener = None

from database import ActivityDatabase
from detector import SmartActivityClassifier
from config import MONITOR_INTERVAL, KEYBOARD_TIMEOUT, LOG_FILE

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class WindowsActivityMonitor:
    """Windows-specific activity monitoring."""

    @staticmethod
    def get_active_window_info():
        """Get the active window application name and title on Windows."""
        try:
            hwnd = ctypes.windll.user32.GetForegroundWindow()
            if hwnd == 0:
                return None, None

            length = ctypes.windll.user32.GetWindowTextLength(hwnd)
            buf = ctypes.create_unicode_buffer(length + 1)
            ctypes.windll.user32.GetWindowText(hwnd, buf, length + 1)
            window_title = buf.value

            try:
                pid = wintypes.DWORD()
                ctypes.windll.user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
                if psutil:
                    process = psutil.Process(pid.value)
                    app_name = process.name().replace('.exe', '')
                    return app_name, window_title
                return 'app', window_title
            except Exception:
                return None, window_title

        except Exception as e:
            logger.error(f"Error getting active window: {e}")
            return None, None

    @staticmethod
    def get_idle_duration():
        """Get the idle duration in seconds (Windows only)."""
        try:
            class LASTINPUTINFO(ctypes.Structure):
                _fields_ = [("cbSize", wintypes.UINT), ("dwTime", wintypes.DWORD)]

            lii = LASTINPUTINFO()
            lii.cbSize = ctypes.sizeof(LASTINPUTINFO)
            ctypes.windll.user32.GetLastInputInfo(ctypes.byref(lii))

            millis = ctypes.windll.kernel32.GetTickCount() - lii.dwTime
            return millis / 1000.0
        except Exception as e:
            logger.error(f"Error getting idle duration: {e}")
            return 0


class LinuxActivityMonitor:
    """Linux-specific activity monitoring (GNOME, Wayland, X11, D-Bus, MPRIS, /proc)."""

    @staticmethod
    def get_idle_duration():
        """Get idle duration in seconds via Mutter IdleMonitor or xprintidle."""
        try:
            out = subprocess.check_output(
                ["gdbus", "call", "--session", "--dest", "org.gnome.Mutter.IdleMonitor",
                 "--object-path", "/org/gnome/Mutter/IdleMonitor/Core",
                 "--method", "org.gnome.Mutter.IdleMonitor.GetIdletime"],
                text=True, stderr=subprocess.DEVNULL
            )
            m = re.search(r"uint64\s+(\d+)", out)
            if m:
                return int(m.group(1)) / 1000.0
        except Exception:
            pass

        try:
            out = subprocess.check_output(["xprintidle"], text=True, stderr=subprocess.DEVNULL)
            return int(out.strip()) / 1000.0
        except Exception:
            pass

        return 0.0

    @staticmethod
    def get_active_media():
        """Query active media from MPRIS D-Bus interfaces."""
        try:
            out = subprocess.check_output(["busctl", "--user", "list"], text=True, stderr=subprocess.DEVNULL)
            players = [line.split()[0] for line in out.splitlines() if "org.mpris.MediaPlayer2" in line]
            for p in players:
                try:
                    res = subprocess.check_output(
                        ["gdbus", "call", "--session", "--dest", p,
                         "--object-path", "/org/mpris/MediaPlayer2",
                         "--method", "org.freedesktop.DBus.Properties.GetAll",
                         "org.mpris.MediaPlayer2.Player"],
                        text=True, stderr=subprocess.DEVNULL
                    )
                    if "'PlaybackStatus': <'Playing'>" in res:
                        title_m = re.search(r"'xesam:title':\s*<'([^']+)'", res)
                        artist_m = re.search(r"'xesam:artist':\s*<\[(?:'([^']+)')?\]>", res)
                        player_name = p.replace("org.mpris.MediaPlayer2.", "").split(".")[0].capitalize()
                        title = title_m.group(1) if title_m else "Media"
                        artist = artist_m.group(1) if artist_m and artist_m.group(1) else ""
                        full_title = f"{artist} - {title}" if artist else title
                        return player_name, full_title
                except Exception:
                    pass
        except Exception:
            pass
        return None, None

    @staticmethod
    def get_active_window_info():
        """Get active window name and title on Linux."""
        # 1. Check MPRIS if actively playing music/media
        media_player, media_title = LinuxActivityMonitor.get_active_media()

        # 2. Check X11/Xwayland active window via xprop
        try:
            root_out = subprocess.check_output(["xprop", "-root", "_NET_ACTIVE_WINDOW"], text=True, stderr=subprocess.DEVNULL)
            m = re.search(r"window id # (0x[0-9a-fA-F]+)", root_out)
            win_id = m.group(1) if m and m.group(1) not in ("0x0", "0x400003") else None

            if not win_id:
                stack_out = subprocess.check_output(["xprop", "-root", "_NET_CLIENT_LIST_STACKING"], text=True, stderr=subprocess.DEVNULL)
                sm = re.search(r"window id # ([0-9a-fA-Fx,\s]+)", stack_out)
                if sm:
                    ids = [x.strip() for x in sm.group(1).split(",") if x.strip()]
                    if ids:
                        win_id = ids[-1]

            if win_id:
                win_props = subprocess.check_output(["xprop", "-id", win_id, "_NET_WM_NAME", "WM_NAME", "WM_CLASS"], text=True, stderr=subprocess.DEVNULL)
                title_m = re.search(r'(?:_NET_WM_NAME|WM_NAME)\([^)]+\)\s*=\s*"([^"]+)"', win_props)
                class_m = re.search(r'WM_CLASS\([^)]+\)\s*=\s*"([^"]+)",\s*"([^"]+)"', win_props)
                
                title = title_m.group(1) if title_m else ""
                app = class_m.group(2) if class_m else (class_m.group(1) if class_m else "")
                if title and title not in ("hidamari", "Wayland to X Recording bridge", "gnome-shell"):
                    return app or "App", title
        except Exception:
            pass

        # 3. If media is playing, return media activity
        if media_player:
            return media_player, media_title

        # 4. Check processes for active IDEs, terminals, browsers
        try:
            whoami = subprocess.check_output(["whoami"], text=True, stderr=subprocess.DEVNULL).strip()
            ps_out = subprocess.check_output(["ps", "-u", whoami, "-o", "comm,args", "--sort=-%cpu"], text=True, stderr=subprocess.DEVNULL)
            for line in ps_out.splitlines()[1:]:
                l = line.lower()
                if "antigravity" in l:
                    return "antigravity", "Antigravity IDE — Agentic Coding"
                if "/code" in l or "code --" in l:
                    return "vscode", "Visual Studio Code"
                if "cursor" in l:
                    return "cursor", "Cursor AI Editor"
                if "brave" in l:
                    return "brave", "Brave Browser"
                if "chrome" in l:
                    return "chrome", "Google Chrome"
                if "firefox" in l:
                    return "firefox", "Mozilla Firefox"
                if "claude" in l:
                    return "claude", "Claude Desktop"
                if "spotify" in l:
                    return "spotify", "Spotify Music"
        except Exception:
            pass

        return "System", "Desktop Workspace"


class MacOSActivityMonitor:
    """macOS-specific activity monitoring."""

    @staticmethod
    def get_active_window_info():
        try:
            cmd = ['osascript', '-e', 'tell application "System Events" to get {name, title} of first application process whose frontmost is true']
            out = subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL)
            parts = out.strip().split(', ')
            if parts:
                app = parts[0]
                title = parts[1] if len(parts) > 1 else app
                return app, title
        except Exception:
            pass
        return "macOS", "Desktop"

    @staticmethod
    def get_idle_duration():
        try:
            out = subprocess.check_output("ioreg -c IOHIDSystem | awk '/HIDIdleTime/ {print int($NF/1000000000); exit}'", shell=True, text=True)
            return float(out.strip())
        except Exception:
            return 0.0


class ActivityMonitor:
    """Main activity monitoring service."""

    def __init__(self):
        self.db = ActivityDatabase()
        self.classifier = SmartActivityClassifier()
        self.running = False
        self.monitoring_thread = None
        self.keyboard_listener_thread = None

        # Activity tracking state
        self.current_activity = None
        self.current_activity_start = None
        self.last_keyboard_activity = time.time()
        self.keyboard_active = False
        self.session_keyboard_events = 0

        # Platform detection
        self.platform = platform.system()
        logger.info(f"ActivityMonitor initialized on {self.platform}")

    def start(self):
        """Start the monitoring service."""
        if self.running:
            logger.warning("Monitor is already running")
            return

        self.running = True
        logger.info(f"Starting activity monitor on {self.platform}...")

        # Start monitoring thread
        self.monitoring_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitoring_thread.start()

        # Start keyboard listener if available
        if platform.system() == 'Windows' and Listener is not None:
            self.keyboard_listener_thread = threading.Thread(
                target=self._start_keyboard_listener, daemon=True
            )
            self.keyboard_listener_thread.start()
            logger.info("Keyboard listener started")
        else:
            logger.info("Using system idle monitor for activity detection")

        logger.info("Activity monitor started successfully")

    def stop(self):
        """Stop the monitoring service."""
        self.running = False
        logger.info("Activity monitor stopped")

        # Save final activity session
        if self.current_activity:
            self._save_activity_session()

    def _monitor_loop(self):
        """Main monitoring loop."""
        logger.info("Monitor loop started")

        while self.running:
            try:
                if self.platform == 'Windows':
                    app_name, window_title = WindowsActivityMonitor.get_active_window_info()
                    idle_sec = WindowsActivityMonitor.get_idle_duration()
                elif self.platform == 'Linux':
                    app_name, window_title = LinuxActivityMonitor.get_active_window_info()
                    idle_sec = LinuxActivityMonitor.get_idle_duration()
                elif self.platform == 'Darwin':
                    app_name, window_title = MacOSActivityMonitor.get_active_window_info()
                    idle_sec = MacOSActivityMonitor.get_idle_duration()
                else:
                    app_name, window_title = 'System', 'Workspace'
                    idle_sec = 0

                is_user_active = idle_sec < KEYBOARD_TIMEOUT

                if app_name and app_name.lower() != 'none' and is_user_active:
                    # Detect activity
                    category, app_display, confidence = self.classifier.classify(
                        app_name, window_title, self.keyboard_active
                    )

                    # Check if activity changed
                    if self.current_activity is None or self.current_activity['app_name'] != app_name:
                        # Save previous activity session
                        if self.current_activity:
                            self._save_activity_session()

                        # Start new activity
                        self.current_activity = {
                            'app_name': app_name,
                            'window_title': window_title,
                            'category': category,
                            'app_display': app_display,
                            'confidence': confidence,
                            'start_time': datetime.now(),
                            'keyboard_events': 0,
                            'keyboard_active': self.keyboard_active
                        }
                        self.session_keyboard_events = 0
                        logger.info(f"New activity: {app_display} ({category}) - Confidence: {confidence:.2f}")

                    else:
                        # Update current activity
                        self.current_activity['confidence'] = max(
                            self.current_activity['confidence'], confidence
                        )
                        self.current_activity['keyboard_active'] = self.keyboard_active
                        self.current_activity['keyboard_events'] = self.session_keyboard_events

                    # Reset keyboard active flag if idle for too long
                    if time.time() - self.last_keyboard_activity > KEYBOARD_TIMEOUT:
                        self.keyboard_active = False

                time.sleep(MONITOR_INTERVAL)

            except Exception as e:
                logger.error(f"Error in monitor loop: {e}")
                time.sleep(MONITOR_INTERVAL)

    def _save_activity_session(self):
        """Save the current activity session to database."""
        if not self.current_activity:
            return

        try:
            duration = (datetime.now() - self.current_activity['start_time']).total_seconds()

            # Only save sessions longer than 5 seconds
            if duration < 5:
                return

            self.db.add_activity(
                app_name=self.current_activity['app_name'],
                window_title=self.current_activity['window_title'],
                category=self.current_activity['category'],
                keyboard_active=self.current_activity['keyboard_active'],
                duration_seconds=int(duration)
            )

            # Update daily summary
            today = datetime.now().strftime('%Y-%m-%d')
            self.db.update_daily_summary(today, self.current_activity['category'], int(duration))

            logger.debug(
                f"Saved session: {self.current_activity['app_display']} - "
                f"{int(duration)}s - {self.current_activity['category']}"
            )

        except Exception as e:
            logger.error(f"Error saving activity session: {e}")

    def _start_keyboard_listener(self):
        """Start listening to keyboard events."""
        if Listener is None:
            logger.warning("pynput not available for keyboard listening")
            return

        def on_press(key):
            self.last_keyboard_activity = time.time()
            self.keyboard_active = True
            self.session_keyboard_events += 1

        def on_release(key):
            pass

        try:
            with Listener(on_press=on_press, on_release=on_release) as listener:
                logger.info("Keyboard listener active")
                listener.join()
        except Exception as e:
            logger.error(f"Error in keyboard listener: {e}")

    def get_status(self):
        """Get current monitoring status."""
        if self.current_activity:
            duration = (datetime.now() - self.current_activity['start_time']).total_seconds()
            return {
                'running': self.running,
                'current_app': self.current_activity['app_display'],
                'current_category': self.current_activity['category'],
                'duration_seconds': int(duration),
                'keyboard_active': self.keyboard_active
            }
        else:
            return {
                'running': self.running,
                'current_app': 'Monitoring...',
                'current_category': 'idle',
                'duration_seconds': 0,
                'keyboard_active': False
            }


def create_monitor():
    """Factory function to create a platform-appropriate monitor."""
    return ActivityMonitor()


if __name__ == '__main__':
    # Test the monitor
    monitor = create_monitor()
    monitor.start()

    try:
        while True:
            status = monitor.get_status()
            print(f"\r{status['current_app']} - {status['current_category']} - {status['duration_seconds']}s", end='')
            time.sleep(MONITOR_INTERVAL)
    except KeyboardInterrupt:
        print("\n\nStopping monitor...")
        monitor.stop()