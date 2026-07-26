"""Database operations for activity tracking."""

import sqlite3
from datetime import datetime
from pathlib import Path
from config import DB_PATH
import logging

logger = logging.getLogger(__name__)


class ActivityDatabase:
    """Manages activity tracking database."""

    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.init_database()

    def init_database(self):
        """Initialize the database with required tables."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Activities table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS activities (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        app_name TEXT NOT NULL,
                        window_title TEXT,
                        category TEXT,
                        keyboard_active BOOLEAN DEFAULT 0,
                        duration_seconds INTEGER DEFAULT 0
                    )
                ''')
                
                # Sessions table for grouped activities
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS sessions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        start_time DATETIME,
                        end_time DATETIME,
                        app_name TEXT,
                        category TEXT,
                        duration_seconds INTEGER,
                        keyboard_activity_percentage REAL
                    )
                ''')
                
                # Daily summary table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS daily_summary (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        date DATE UNIQUE,
                        coding_seconds INTEGER DEFAULT 0,
                        music_seconds INTEGER DEFAULT 0,
                        other_seconds INTEGER DEFAULT 0,
                        total_active_seconds INTEGER DEFAULT 0
                    )
                ''')
                
                # Create indexes for better query performance
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON activities(timestamp)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_category ON activities(category)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_date ON daily_summary(date)')
                
                conn.commit()
                logger.info(f"Database initialized at {self.db_path}")
        except sqlite3.Error as e:
            logger.error(f"Database initialization error: {e}")
            raise

    def add_activity(self, app_name, window_title, category, keyboard_active=False, duration_seconds=0):
        """Add a new activity record."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO activities 
                    (app_name, window_title, category, keyboard_active, duration_seconds)
                    VALUES (?, ?, ?, ?, ?)
                ''', (app_name, window_title, category, keyboard_active, duration_seconds))
                conn.commit()
        except sqlite3.Error as e:
            logger.error(f"Error adding activity: {e}")

    def get_activities(self, start_date=None, end_date=None, category=None):
        """Retrieve activities within a date range and optional category filter."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                query = 'SELECT * FROM activities WHERE 1=1'
                params = []
                
                if start_date:
                    query += ' AND DATE(timestamp) >= ?'
                    params.append(start_date)
                if end_date:
                    query += ' AND DATE(timestamp) <= ?'
                    params.append(end_date)
                if category:
                    query += ' AND category = ?'
                    params.append(category)
                
                query += ' ORDER BY timestamp DESC'
                cursor.execute(query, params)
                return cursor.fetchall()
        except sqlite3.Error as e:
            logger.error(f"Error retrieving activities: {e}")
            return []

    def get_daily_summary(self, date):
        """Get daily summary for a specific date."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM daily_summary WHERE date = ?', (date,))
                return cursor.fetchone()
        except sqlite3.Error as e:
            logger.error(f"Error retrieving daily summary: {e}")
            return None

    def update_daily_summary(self, date, category, seconds):
        """Update or create daily summary."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Check if record exists
                cursor.execute('SELECT id FROM daily_summary WHERE date = ?', (date,))
                record = cursor.fetchone()
                
                if record:
                    column = f'{category}_seconds'
                    cursor.execute(f'UPDATE daily_summary SET {column} = {column} + ? WHERE date = ?',
                                 (seconds, date))
                else:
                    cursor.execute('''
                        INSERT INTO daily_summary (date, coding_seconds, music_seconds, other_seconds)
                        VALUES (?, 0, 0, 0)
                    ''', (date,))
                    column = f'{category}_seconds'
                    cursor.execute(f'UPDATE daily_summary SET {column} = ? WHERE date = ?',
                                 (seconds, date))
                
                conn.commit()
        except sqlite3.Error as e:
            logger.error(f"Error updating daily summary: {e}")

    def get_weekly_summary(self, end_date=None):
        """Get weekly summary."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                if end_date is None:
                    end_date = datetime.now().strftime('%Y-%m-%d')
                
                query = '''
                    SELECT 
                        date,
                        coding_seconds,
                        music_seconds,
                        other_seconds
                    FROM daily_summary
                    WHERE date >= DATE(?, '-6 days')
                    AND date <= ?
                    ORDER BY date
                '''
                cursor.execute(query, (end_date, end_date))
                return cursor.fetchall()
        except sqlite3.Error as e:
            logger.error(f"Error retrieving weekly summary: {e}")
            return []

    def get_activity_by_app(self, start_date=None, end_date=None):
        """Get aggregated activity time by application."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                query = '''
                    SELECT 
                        app_name,
                        category,
                        COUNT(*) as occurrences,
                        SUM(duration_seconds) as total_seconds
                    FROM activities
                    WHERE 1=1
                '''
                params = []
                
                if start_date:
                    query += ' AND DATE(timestamp) >= ?'
                    params.append(start_date)
                if end_date:
                    query += ' AND DATE(timestamp) <= ?'
                    params.append(end_date)
                
                query += ' GROUP BY app_name ORDER BY total_seconds DESC'
                cursor.execute(query, params)
                return cursor.fetchall()
        except sqlite3.Error as e:
            logger.error(f"Error retrieving activity by app: {e}")
            return []

    def clear_old_data(self, days=90):
        """Clear data older than specified days."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    DELETE FROM activities 
                    WHERE DATE(timestamp) < DATE('now', '-' || ? || ' days')
                ''', (days,))
                cursor.execute('''
                    DELETE FROM daily_summary 
                    WHERE date < DATE('now', '-' || ? || ' days')
                ''', (days,))
                conn.commit()
                logger.info(f"Cleared data older than {days} days")
        except sqlite3.Error as e:
            logger.error(f"Error clearing old data: {e}")