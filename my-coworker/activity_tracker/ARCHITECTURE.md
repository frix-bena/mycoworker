# 🏗️ System Architecture & Documentation

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      ACTIVITY TRACKER SYSTEM                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       USER INTERFACE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📊 Streamlit Web Dashboard (http://localhost:8501)              │
│     ├── Summary Metrics (Total coding, music, other time)        │
│     ├── Interactive Charts (Pie, Bar, Timeline)                  │
│     ├── Daily Breakdown                                          │
│     ├── Weekly Statistics                                        │
│     └── Top Applications Table                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         ↕ HTTP / Updates
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKGROUND SERVICE LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🔄 Activity Monitor (monitor.py)                                │
│     ├── Windows Activity Monitor                                 │
│     │   ├── Get Active Window (Every 5 seconds)                 │
│     │   └── Get Idle Duration                                   │
│     │                                                            │
│     ├── Keyboard Listener (Continuous)                           │
│     │   └── Detect Key Press Events                             │
│     │                                                            │
│     └── Session Management                                       │
│         └── Group Activities into Sessions                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         ↓ Activity Data
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AI DETECTION ENGINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🤖 Smart Activity Classifier (detector.py)                      │
│     ├── Keyword Matching                                        │
│     │   ├── Coding Apps (VS Code, PyCharm, etc.)               │
│     │   ├── Music Apps (Spotify, YouTube, etc.)                │
│     │   └── Other Apps (Browser, Chat, etc.)                   │
│     │                                                            │
│     ├── Pattern Recognition                                     │
│     │   └── Learn from Activity History                         │
│     │                                                            │
│     ├── Context Analysis                                        │
│     │   ├── Keyboard Activity Status                           │
│     │   ├── Previous Activity Category                         │
│     │   └── Time Since Last Activity                           │
│     │                                                            │
│     └── Confidence Scoring (0.0 - 1.0)                         │
│         └── Adjust based on multiple factors                   │
│                                                                   │
│  Returns: (category, app_display_name, confidence)              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         ↓ Classified Activities
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  💾 SQLite Database (activity_tracker.db)                        │
│     ├── activities Table (Raw Activity Records)                 │
│     │   ├── Timestamp                                           │
│     │   ├── Application Name                                    │
│     │   ├── Window Title                                        │
│     │   ├── Category (coding/music/other)                      │
│     │   ├── Keyboard Activity Flag                             │
│     │   └── Duration (seconds)                                  │
│     │                                                            │
│     ├── sessions Table (Grouped Sessions)                       │
│     │   ├── Session Time Range                                  │
│     │   ├── Application & Category                             │
│     │   ├── Total Duration                                      │
│     │   └── Keyboard Activity Percentage                       │
│     │                                                            │
│     └── daily_summary Table (Aggregated Data)                   │
│         ├── Date                                                 │
│         ├── Coding Time (seconds)                               │
│         ├── Music Time (seconds)                                │
│         ├── Other Activities Time (seconds)                     │
│         └── Total Active Time (seconds)                         │
│                                                                   │
│  📊 Indexes for Performance                                      │
│     ├── idx_timestamp (for time-based queries)                 │
│     ├── idx_category (for activity filtering)                  │
│     └── idx_date (for daily summaries)                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         DATA FLOW DIAGRAM                         │
└──────────────────────────────────────────────────────────────────┘

1. MONITORING PHASE
   ┌─────────────────────────────────────────────────────────────┐
   │ Windows API                                                  │
   │ • GetForegroundWindow() → Get active window handle         │
   │ • GetWindowText() → Get window title                        │
   │ • GetWindowThreadProcessId() → Get process ID             │
   │ • GetLastInputInfo() → Get idle time                       │
   └──────────────┬──────────────────────────────────────────────┘
                  │
                  ↓
   ┌──────────────────────────────────────────────────────────────┐
   │ Keyboard Listener (pynput)                                    │
   │ • Continuous event listener                                  │
   │ • Records key press events                                   │
   │ • Timestamps each event                                      │
   └──────────────┬──────────────────────────────────────────────┘
                  │
                  ↓
   ┌──────────────────────────────────────────────────────────────┐
   │ Activity Data Tuple                                            │
   │ (app_name, window_title, keyboard_active, timestamp)        │
   └──────────────┬──────────────────────────────────────────────┘

2. DETECTION PHASE
   ├─ Keyword Matching (App & Title)
   │  └─ Pattern: "vscode" → Category: "coding"
   │
   ├─ Confidence Scoring
   │  └─ Base + Keyboard Boost + Pattern Boost = Final Score
   │
   └─ Smart Classification
      └─ (category, app_display_name, confidence)

3. STORAGE PHASE
   ├─ Save to activities table
   ├─ Update daily_summary
   └─ Update sessions table

4. AGGREGATION PHASE
   ├─ Group by day for daily_summary
   ├─ Calculate totals per category
   └─ Calculate weekly summaries

5. VISUALIZATION PHASE
   ├─ Streamlit reads from database
   ├─ Formats data for Plotly charts
   ├─ Renders interactive dashboard
   └─ User views real-time insights
```

## Module Responsibilities

### config.py
- **Purpose**: Centralized configuration
- **Contains**: 
  - Monitoring parameters (interval, timeouts)
  - Application category keywords
  - File paths
  - Dashboard settings
  - Data retention policies

### monitor.py
- **Purpose**: Real-time activity monitoring
- **Classes**:
  - `WindowsActivityMonitor`: Windows-specific window detection
  - `ActivityMonitor`: Main monitoring service
- **Responsibilities**:
  - Poll active window
  - Listen to keyboard events
  - Manage activity sessions
  - Save to database

### detector.py
- **Purpose**: AI activity classification
- **Classes**:
  - `ActivityDetector`: Rule-based detection
  - `SmartActivityClassifier`: ML-inspired detection with history
- **Responsibilities**:
  - Match keywords
  - Assign categories
  - Score confidence
  - Learn from patterns

### database.py
- **Purpose**: Data persistence and queries
- **Class**: `ActivityDatabase`
- **Methods**:
  - Initialize schema
  - CRUD operations on activities
  - Aggregate statistics
  - Generate reports

### service.py
- **Purpose**: Service wrapper and daemon management
- **Class**: `ActivityTrackerService`
- **Responsibilities**:
  - Manage monitor lifecycle
  - Handle signals
  - Logging initialization

### dashboard.py
- **Purpose**: Web UI and visualization
- **Framework**: Streamlit
- **Features**:
  - Real-time metric displays
  - Interactive charts
  - Time period selection
  - Data filtering and sorting

### setup.py
- **Purpose**: Installation and initialization
- **Responsibilities**:
  - Verify Python version
  - Install dependencies
  - Initialize database

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend & UI                                               │
│ ├── Streamlit (Web Framework)                              │
│ └── Plotly (Charting & Visualization)                      │
│                                                              │
│ Backend & Core                                              │
│ ├── Python 3.8+ (Language)                                 │
│ ├── SQLite 3 (Database)                                    │
│ ├── psutil (System Monitoring)                             │
│ └── pynput (Keyboard Monitoring)                           │
│                                                              │
│ Data Processing                                             │
│ ├── Pandas (Data Manipulation)                             │
│ ├── datetime (Time Handling)                               │
│ └── SQLite (Data Aggregation)                             │
│                                                              │
│ Platform Support                                            │
│ ├── Windows (Primary - Full Support)                       │
│ ├── Linux (Partial - Limited API)                          │
│ └── macOS (Partial - Limited API)                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   USER'S COMPUTER                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │          Local Python Environment                        │ │
│ │ ├── activity_tracker/                                   │ │
│ │ │   ├── config.py                                       │ │
│ │ │   ├── monitor.py (RUNNING)                           │ │
│ │ │   ├── detector.py                                     │ │
│ │ │   ├── dashboard.py (RUNNING)                         │ │
│ │ │   ├── database.py                                     │ │
│ │ │   ├── service.py                                      │ │
│ │ │   └── data/                                           │ │
│ │ │       └── activity_tracker.db                        │ │
│ │ └── Dependencies                                        │ │
│ │     ├── streamlit                                       │ │
│ │     ├── plotly                                          │ │
│ │     ├── pandas                                          │ │
│ │     ├── psutil                                          │ │
│ │     └── pynput                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │          Monitor Service Thread                          │ │
│ │ ├── Polling (5s intervals)                              │ │
│ │ ├── Active Window Detection                             │ │
│ │ └── Database Writes                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │          Keyboard Listener Thread                        │ │
│ │ ├── Global Key Monitoring                               │ │
│ │ ├── Event Timestamp Recording                           │ │
│ │ └── Activity Flag Updates                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │          Web Server (Streamlit)                          │ │
│ │ ├── Listening on http://localhost:8501                 │ │
│ │ ├── Database Reads                                      │ │
│ │ └── Chart Generation                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │          Browser                                         │ │
│ │ └── Displays Dashboard at http://localhost:8501        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security & Privacy Model

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Data Flow                                                    │
│ ├─ Activities Detected ↓                                    │
│ ├─ Stored Locally ↓                                         │
│ ├─ No Internet Connection Required                          │
│ └─ No Data Transmission Outside PC                          │
│                                                              │
│ Data Access                                                  │
│ ├─ Local File System Only                                   │
│ ├─ SQLite Database (File-based)                             │
│ ├─ User Can Inspect Anytime                                 │
│ └─ User Can Delete Anytime                                  │
│                                                              │
│ Permissions Required                                        │
│ ├─ Read Access: Window Information (No special perms)      │
│ ├─ Read Access: Keyboard Events (No special perms)         │
│ ├─ Write Access: Local Database File                        │
│ └─ No Admin Mode Required                                   │
│                                                              │
│ Data Retention                                              │
│ ├─ Default: 90 days                                         │
│ ├─ Configurable in config.py                               │
│ └─ Can be cleared manually anytime                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Performance Metrics

```
┌─────────────────────────────────────────────────────────────┐
│                    PERFORMANCE TARGETS                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ CPU Usage                                                    │
│ ├─ Monitor Service: <1% average                             │
│ ├─ Keyboard Listener: <0.5% average                         │
│ └─ Dashboard (Running): 1-3%                                │
│                                                              │
│ Memory Usage                                                 │
│ ├─ Monitor Service: ~30-50 MB                               │
│ ├─ Dashboard: ~100-150 MB                                   │
│ └─ Total: ~200 MB when both running                         │
│                                                              │
│ Disk I/O                                                     │
│ ├─ Database Write: Every activity change                    │
│ ├─ Database Read: On dashboard load/refresh                 │
│ └─ Total Data Size: ~1 MB per week                          │
│                                                              │
│ Response Time                                                │
│ ├─ Activity Detection: <100 ms                              │
│ ├─ Dashboard Load: 1-3 seconds                              │
│ └─ Chart Generation: <2 seconds                             │
│                                                              │
│ Scalability                                                  │
│ ├─ Handles 100+ activities per day                          │
│ ├─ Stores 6 months of data efficiently                      │
│ └─ Dashboard remains responsive                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Development & Extensibility

### Adding New Activity Categories

1. Add keyword in `config.py`:
```python
MY_CATEGORY_APPS = {
    'myapp': 'My App Display Name',
}
```

2. Update `detector.py` to check new category

3. Update dashboard charts (if needed)

### Adding New Dashboard Features

Edit `dashboard.py`:
- Use Plotly for new charts
- Query database in `database.py`
- Add to sidebar controls
- Update metrics display

### Modifying Detection Logic

Edit `detector.py`:
- Adjust keyword matching
- Change confidence calculation
- Add pattern recognition
- Implement custom heuristics

### Database Schema Changes

1. Modify `database.py` `init_database()` method
2. Create migration if keeping old data
3. Test with existing data

---

**This architecture provides a scalable, modular, and maintainable solution for activity tracking.**
