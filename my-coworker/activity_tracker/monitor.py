"""Main activity monitoring service."""

import logging
import time
import threading
from datetime import datetime
from pathlib import Path

# Platform-specific imports
import platform

if platform.system() == 'Windows':
    import ctypes
    from ctypes import wintypes
    import psutil
    try:
        from pynput.keyboard import Listener
    except ImportError:
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
            # Get the foreground window handle
            hwnd = ctypes.windll.user32.GetForegroundWindow()
            if hwnd == 0:
                return None, None

            # Get window title
            length = ctypes.windll.user32.GetWindowTextLength(hwnd)
            buf = ctypes.create_unicode_buffer(length + 1)
            ctypes.windll.user32.GetWindowText(hwnd, buf, length + 1)
            window_title = buf.value

            # Get process name
            try:
                pid = wintypes.DWORD()
                ctypes.windll.user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
                process = psutil.Process(pid.value)
                app_name = process.name().replace('.exe', '')
                return app_name, window_title
            except (psutil.NoSuchProcess, psutil.AccessDenied):
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
        if self.platform != 'Windows':
            logger.warning(f"Activity Monitor is optimized for Windows. Current platform: {self.platform}")

        logger.info(f"ActivityMonitor initialized on {self.platform}")

    def start(self):
        """Start the monitoring service."""
        if self.running:
            logger.warning("Monitor is already running")
            return

        self.running = True
        logger.info("Starting activity monitor...")

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
            logger.warning("Keyboard listener not available on this platform")

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
                else:
                    app_name, window_title = None, None

                if app_name and app_name.lower() != 'none':
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