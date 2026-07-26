"""Activity detection and categorization logic."""

import logging
from config import CODING_APPS, MUSIC_APPS, OTHER_APPS

logger = logging.getLogger(__name__)


class ActivityDetector:
    """Detects and categorizes activities based on application and window title."""

    def __init__(self):
        self.coding_keywords = list(CODING_APPS.keys())
        self.music_keywords = list(MUSIC_APPS.keys())
        self.other_keywords = list(OTHER_APPS.keys())

    def detect_activity(self, app_name, window_title='', keyboard_active=False):
        """
        Detect activity category based on app and window title.
        
        Returns:
            tuple: (category, app_display_name, confidence)
                - category: 'coding', 'music', 'other', or 'idle'
                - app_display_name: Human-readable app name
                - confidence: 0.0-1.0 confidence score
        """
        app_name_lower = app_name.lower()
        title_lower = window_title.lower() if window_title else ''

        # Check for coding activities
        for keyword in self.coding_keywords:
            if keyword in app_name_lower or keyword in title_lower:
                app_display = CODING_APPS.get(keyword, app_name)
                confidence = 0.9 if keyword in app_name_lower else 0.7
                
                # Boost confidence if keyboard is active (likely coding)
                if keyboard_active:
                    confidence = min(1.0, confidence + 0.1)
                
                return 'coding', app_display, confidence

        # Check for music activities
        for keyword in self.music_keywords:
            if keyword in app_name_lower or keyword in title_lower:
                app_display = MUSIC_APPS.get(keyword, app_name)
                # Lower confidence for music since it might be browser usage
                confidence = 0.8 if keyword in app_name_lower else 0.6
                return 'music', app_display, confidence

        # Check for other categorized activities
        for keyword in self.other_keywords:
            if keyword in app_name_lower or keyword in title_lower:
                app_display = OTHER_APPS.get(keyword, app_name)
                confidence = 0.75
                return 'other', app_display, confidence

        # Heuristic: if keyboard is active and it's not known, assume coding
        if keyboard_active:
            return 'coding', app_name, 0.5

        # Default to other
        return 'other', app_name, 0.3

    def refine_detection(self, app_name, window_title, keyboard_active, 
                        previous_category=None, time_since_last_activity=0):
        """
        Refined detection using temporal and contextual information.
        
        Args:
            app_name: Current application name
            window_title: Current window title
            keyboard_active: Whether keyboard is active
            previous_category: Previous activity category
            time_since_last_activity: Seconds since last activity
            
        Returns:
            tuple: (category, app_display_name, confidence)
        """
        category, app_display, confidence = self.detect_activity(
            app_name, window_title, keyboard_active
        )

        # If too much time has passed since last activity, lower confidence
        if time_since_last_activity > 60:
            confidence = max(0.1, confidence - 0.2)

        # If category is the same as previous and keyboard is active, boost confidence
        if previous_category == category and keyboard_active:
            confidence = min(1.0, confidence + 0.15)

        return category, app_display, confidence

    def get_activity_summary(self, category):
        """Get a human-readable summary for an activity category."""
        summaries = {
            'coding': 'Coding & Development',
            'music': 'Music & Audio',
            'other': 'Other Activities',
            'idle': 'Idle'
        }
        return summaries.get(category, 'Unknown')


class SmartActivityClassifier:
    """AI-enhanced activity classifier using heuristics and patterns."""

    def __init__(self):
        self.detector = ActivityDetector()
        self.activity_history = []
        self.max_history = 100

    def classify(self, app_name, window_title='', keyboard_active=False):
        """Classify activity with learning from history."""
        category, app_display, confidence = self.detector.detect_activity(
            app_name, window_title, keyboard_active
        )

        # Store in history for learning
        self.activity_history.append({
            'app_name': app_name,
            'category': category,
            'confidence': confidence
        })

        # Keep history size manageable
        if len(self.activity_history) > self.max_history:
            self.activity_history = self.activity_history[-self.max_history:]

        # Enhance with pattern recognition
        confidence = self._apply_pattern_recognition(
            app_name, category, confidence
        )

        return category, app_display, confidence

    def _apply_pattern_recognition(self, app_name, category, base_confidence):
        """
        Apply pattern recognition based on activity history.
        
        Returns:
            Enhanced confidence score
        """
        if not self.activity_history:
            return base_confidence

        # Check if this app appears frequently as a certain category
        recent_history = self.activity_history[-50:]
        same_category_count = sum(
            1 for h in recent_history 
            if h['app_name'].lower() == app_name.lower() 
            and h['category'] == category
        )

        # Boost confidence if pattern is consistent
        pattern_boost = min(0.2, same_category_count * 0.01)
        return min(1.0, base_confidence + pattern_boost)

    def get_category_statistics(self):
        """Get statistics about classified activities."""
        if not self.activity_history:
            return {}

        stats = {
            'coding': 0,
            'music': 0,
            'other': 0
        }

        for item in self.activity_history:
            if item['category'] in stats:
                stats[item['category']] += 1

        total = sum(stats.values())
        if total > 0:
            for key in stats:
                stats[key] = (stats[key] / total) * 100

        return stats
