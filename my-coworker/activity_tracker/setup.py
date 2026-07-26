"""Setup and initialization script for the Activity Tracker."""

import sys
import subprocess
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent


def check_python_version():
    """Check if Python version is 3.8 or higher."""
    if sys.version_info < (3, 8):
        logger.error(f"Python 3.8+ is required. Current version: {sys.version}")
        sys.exit(1)
    logger.info(f"Python version: {sys.version}")


def install_dependencies():
    """Install required Python packages."""
    requirements_file = BASE_DIR / "requirements.txt"

    if not requirements_file.exists():
        logger.error(f"requirements.txt not found at {requirements_file}")
        sys.exit(1)

    logger.info("Installing dependencies...")
    logger.info("This may take a few minutes on first run...")

    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "-r", str(requirements_file)],
            cwd=str(BASE_DIR)
        )
        logger.info("Dependencies installed successfully!")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error installing dependencies: {e}")
        sys.exit(1)


def init_database():
    """Initialize the database."""
    logger.info("Initializing database...")

    try:
        from database import ActivityDatabase
        db = ActivityDatabase()
        logger.info("Database initialized successfully!")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        sys.exit(1)


def main():
    """Main setup function."""
    logger.info("=" * 60)
    logger.info("Activity Tracker - Setup")
    logger.info("=" * 60)

    # Check Python version
    check_python_version()

    # Install dependencies
    install_dependencies()

    # Initialize database
    init_database()

    logger.info("=" * 60)
    logger.info("Setup completed successfully!")
    logger.info("=" * 60)
    logger.info("\nYou can now:")
    logger.info("1. Start the monitor service: python service.py")
    logger.info("2. View the dashboard: streamlit run dashboard.py")
    logger.info("=" * 60)


if __name__ == '__main__':
    main()
