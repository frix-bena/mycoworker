"""Background service runner for the activity monitor."""

import sys
import time
import logging
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from monitor import create_monitor
from config import LOG_FILE
import atexit

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


class ActivityTrackerService:
    """Service wrapper for the activity monitor."""

    def __init__(self):
        self.monitor = None
        self.running = False

    def start(self):
        """Start the activity tracking service."""
        try:
            logger.info("=" * 60)
            logger.info(f"Activity Tracker Service starting at {datetime.now()}")
            logger.info("=" * 60)

            self.monitor = create_monitor()
            self.monitor.start()
            self.running = True

            logger.info("Service started successfully")
            logger.info("Monitor is now tracking your activities...")
            logger.info("Press Ctrl+C to stop the service")

            # Register cleanup on exit
            atexit.register(self.stop)

            # Keep the service running
            while self.running:
                time.sleep(1)

        except Exception as e:
            logger.error(f"Error starting service: {e}", exc_info=True)
            raise

    def stop(self):
        """Stop the activity tracking service."""
        if not self.running:
            return

        try:
            logger.info("Stopping Activity Tracker Service...")
            if self.monitor:
                self.monitor.stop()
            self.running = False
            logger.info("Service stopped successfully")
            logger.info("=" * 60)
        except Exception as e:
            logger.error(f"Error stopping service: {e}", exc_info=True)


def main():
    """Main entry point."""
    service = ActivityTrackerService()

    try:
        service.start()
    except KeyboardInterrupt:
        print("\n")
        service.stop()
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        service.stop()
        sys.exit(1)


if __name__ == '__main__':
    main()
