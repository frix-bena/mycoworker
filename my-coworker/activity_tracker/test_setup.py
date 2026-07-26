"""Test script to verify the Activity Tracker setup."""

import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).parent


def test_imports():
    """Test if all required modules can be imported."""
    print("Testing imports...")
    modules = ['sqlite3', 'logging', 'threading', 'datetime', 'pathlib']
    
    try:
        for module in modules:
            __import__(module)
        print("✓ Standard library imports OK")
    except ImportError as e:
        print(f"✗ Standard library import failed: {e}")
        return False

    # Test third-party imports
    third_party = {
        'streamlit': 'Streamlit',
        'plotly': 'Plotly',
        'pandas': 'Pandas',
        'psutil': 'psutil'
    }

    missing = []
    for module, name in third_party.items():
        try:
            __import__(module)
            print(f"✓ {name} OK")
        except ImportError:
            print(f"✗ {name} NOT FOUND")
            missing.append(module)

    if missing:
        print(f"\nMissing modules: {', '.join(missing)}")
        print("Run: python setup.py")
        return False

    # Test platform-specific imports
    import platform
    if platform.system() == 'Windows':
        try:
            import psutil
            import ctypes
            print("✓ Windows-specific modules OK")
        except ImportError as e:
            print(f"✗ Windows module import failed: {e}")
            return False

    return True


def test_database():
    """Test database initialization."""
    print("\nTesting database...")

    try:
        from database import ActivityDatabase
        db = ActivityDatabase()
        print("✓ Database initialization OK")

        # Test basic operations
        from datetime import datetime
        db.add_activity('test_app', 'Test Window', 'coding', True)
        activities = db.get_activities()
        if activities:
            print(f"✓ Database read/write OK ({len(activities)} records)")
        else:
            print("✓ Database operations OK (no existing records)")

        return True
    except Exception as e:
        print(f"✗ Database test failed: {e}")
        return False


def test_detector():
    """Test activity detection."""
    print("\nTesting activity detector...")

    try:
        from detector import SmartActivityClassifier

        classifier = SmartActivityClassifier()

        # Test coding detection
        category, app, confidence = classifier.classify('Code.exe', 'main.py', True)
        assert category == 'coding', f"Expected 'coding', got '{category}'"
        print(f"✓ Coding detection OK (confidence: {confidence:.2f})")

        # Test music detection
        category, app, confidence = classifier.classify('Spotify.exe', '', False)
        assert category == 'music', f"Expected 'music', got '{category}'"
        print(f"✓ Music detection OK (confidence: {confidence:.2f})")

        # Test other detection
        category, app, confidence = classifier.classify('Explorer.exe', '', False)
        print(f"✓ Other detection OK (category: {category})")

        return True
    except Exception as e:
        print(f"✗ Detector test failed: {e}")
        return False


def test_monitor():
    """Test monitor initialization."""
    print("\nTesting monitor...")

    try:
        from monitor import create_monitor
        monitor = create_monitor()
        print("✓ Monitor initialization OK")

        status = monitor.get_status()
        print(f"✓ Monitor status retrieval OK")
        print(f"  Current activity: {status['current_app']}")

        return True
    except Exception as e:
        print(f"✗ Monitor test failed: {e}")
        return False


def test_config():
    """Test configuration."""
    print("\nTesting configuration...")

    try:
        from config import (
            MONITOR_INTERVAL,
            KEYBOARD_TIMEOUT,
            CODING_APPS,
            MUSIC_APPS,
            DB_PATH,
            LOG_FILE
        )

        print(f"✓ Configuration loaded OK")
        print(f"  Monitor interval: {MONITOR_INTERVAL}s")
        print(f"  Keyboard timeout: {KEYBOARD_TIMEOUT}s")
        print(f"  Known coding apps: {len(CODING_APPS)}")
        print(f"  Known music apps: {len(MUSIC_APPS)}")
        print(f"  Database: {DB_PATH}")
        print(f"  Logs: {LOG_FILE}")

        return True
    except Exception as e:
        print(f"✗ Configuration test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("Activity Tracker - System Test")
    print("=" * 60)

    tests = [
        ("Configuration", test_config),
        ("Imports", test_imports),
        ("Database", test_database),
        ("Detector", test_detector),
        ("Monitor", test_monitor),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n✗ {test_name} test crashed: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")

    print("=" * 60)
    print(f"Result: {passed}/{total} tests passed")
    print("=" * 60)

    if passed == total:
        print("\n✓ All tests passed! You're ready to go.")
        print("\nNext steps:")
        print("1. Start the monitor: python service.py")
        print("2. In another terminal, start the dashboard: streamlit run dashboard.py")
        return 0
    else:
        print("\n✗ Some tests failed. Please check the errors above.")
        print("Run: python setup.py")
        return 1


if __name__ == '__main__':
    sys.exit(main())
