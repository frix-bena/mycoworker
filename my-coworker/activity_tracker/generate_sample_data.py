"""Generate sample/test data for the Activity Tracker."""

import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

sys.path.insert(0, str(Path(__file__).parent))

from database import ActivityDatabase
from config import CODING_APPS, MUSIC_APPS

def generate_sample_data(days=7):
    """Generate sample data for testing."""
    db = ActivityDatabase()
    
    print("Generating sample activity data...")
    print(f"Creating {days} days of sample data...")
    
    coding_apps = [
        ('Code.exe', 'Visual Studio Code', list(CODING_APPS.keys())[:5]),
        ('PyCharm64.exe', 'PyCharm', ['pycharm']),
        ('devenv.exe', 'Visual Studio', ['visual studio']),
    ]
    
    music_apps = [
        ('Spotify.exe', 'Spotify', ['spotify']),
        ('chrome.exe', 'YouTube Music', ['youtube']),
        ('vlc.exe', 'VLC Media Player', ['vlc']),
    ]
    
    other_apps = [
        ('explorer.exe', 'Windows Explorer', ['explorer']),
        ('cmd.exe', 'Command Prompt', ['cmd']),
        ('notepad.exe', 'Notepad', ['notepad']),
    ]
    
    start_date = datetime.now() - timedelta(days=days-1)
    
    for day_offset in range(days):
        current_date = start_date + timedelta(days=day_offset)
        date_str = current_date.strftime('%Y-%m-%d')
        
        # Simulate daily activities
        # Morning: Light work
        for hour in range(7, 10):
            timestamp = current_date.replace(hour=hour, minute=random.randint(0, 59))
            db.add_activity(
                app_name=random.choice(coding_apps)[0],
                window_title=random.choice(coding_apps)[1],
                category='coding',
                keyboard_active=True
            )
        
        # Mid-morning: Coding
        for hour in range(10, 12):
            timestamp = current_date.replace(hour=hour, minute=random.randint(0, 59))
            db.add_activity(
                app_name=random.choice(coding_apps)[0],
                window_title=random.choice(coding_apps)[1],
                category='coding',
                keyboard_active=True
            )
        
        # Lunch: Other
        for hour in range(12, 13):
            db.add_activity(
                app_name=random.choice(other_apps)[0],
                window_title=random.choice(other_apps)[1],
                category='other',
                keyboard_active=False
            )
        
        # Afternoon: Coding + Music
        for hour in range(13, 17):
            if random.random() > 0.5:
                db.add_activity(
                    app_name=random.choice(coding_apps)[0],
                    window_title=random.choice(coding_apps)[1],
                    category='coding',
                    keyboard_active=True
                )
            else:
                db.add_activity(
                    app_name=random.choice(music_apps)[0],
                    window_title=random.choice(music_apps)[1],
                    category='music',
                    keyboard_active=False
                )
        
        # Late afternoon: Coding
        for hour in range(17, 19):
            db.add_activity(
                app_name=random.choice(coding_apps)[0],
                window_title=random.choice(coding_apps)[1],
                category='coding',
                keyboard_active=True
            )
        
        # Evening: Music + Other
        for hour in range(19, 21):
            if random.random() > 0.6:
                db.add_activity(
                    app_name=random.choice(music_apps)[0],
                    window_title=random.choice(music_apps)[1],
                    category='music',
                    keyboard_active=False
                )
            else:
                db.add_activity(
                    app_name=random.choice(other_apps)[0],
                    window_title=random.choice(other_apps)[1],
                    category='other',
                    keyboard_active=False
                )
        
        # Update daily summary
        total_coding = 0
        total_music = 0
        total_other = 0
        
        # Rough estimate based on above (adjust as needed)
        total_coding = random.randint(6*3600, 8*3600)      # 6-8 hours
        total_music = random.randint(1*3600, 3*3600)       # 1-3 hours
        total_other = random.randint(1*3600, 2*3600)       # 1-2 hours
        
        db.update_daily_summary(date_str, 'coding', total_coding)
        db.update_daily_summary(date_str, 'music', total_music)
        db.update_daily_summary(date_str, 'other', total_other)
        
        print(f"  ✓ Generated data for {date_str}")
    
    print("\n✓ Sample data generation complete!")
    print(f"✓ Created data for {days} days")
    print("\nYou can now:")
    print("1. Start the monitor: python service.py")
    print("2. View the dashboard: streamlit run dashboard.py")
    print("3. Check different time periods in the sidebar")


def clear_data():
    """Clear all data from database."""
    db = ActivityDatabase()
    
    print("WARNING: This will delete all activity data!")
    response = input("Are you sure? (yes/no): ").lower().strip()
    
    if response == 'yes':
        # Delete the database file
        import os
        db_path = Path(__file__).parent / 'data' / 'activity_tracker.db'
        if db_path.exists():
            os.remove(db_path)
            print("✓ Database cleared")
            
            # Reinitialize
            db = ActivityDatabase()
            print("✓ Database reinitialized")
        else:
            print("Database file not found")
    else:
        print("Cancelled")


def main():
    """Main entry point."""
    print("=" * 60)
    print("Activity Tracker - Sample Data Generator")
    print("=" * 60)
    
    if len(sys.argv) < 2:
        print("\nUsage: python generate_sample_data.py [command]")
        print("\nCommands:")
        print("  generate [days]  - Generate sample data (default: 7 days)")
        print("  clear           - Clear all data from database")
        print("\nExamples:")
        print("  python generate_sample_data.py generate")
        print("  python generate_sample_data.py generate 30")
        print("  python generate_sample_data.py clear")
        return 1
    
    command = sys.argv[1].lower()
    
    if command == 'generate':
        days = 7
        if len(sys.argv) > 2:
            try:
                days = int(sys.argv[2])
                if days < 1:
                    print("Error: Days must be at least 1")
                    return 1
            except ValueError:
                print("Error: Invalid number of days")
                return 1
        
        generate_sample_data(days)
        return 0
    
    elif command == 'clear':
        clear_data()
        return 0
    
    else:
        print(f"Unknown command: {command}")
        return 1


if __name__ == '__main__':
    sys.exit(main())
