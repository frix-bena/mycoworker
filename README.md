<div align="center">

# ⚡ Activity Tracker

**A modern, local-first developer activity and productivity tracker that shows where your time actually goes — Coding, Music, Work, or Learning.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Chart.js](https://img.shields.io/badge/Charts-Chart.js-FF6384?logo=chart.js&logoColor=white)](https://www.chartjs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#1-install-dependencies)
  - [Running Development Server](#2-start-development-mode)
  - [Production Build](#3-production-build)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Configuration](#-configuration)
- [Privacy & Offline Guarantee](#-privacy--offline-guarantee)

---

## 🎯 About

**Activity Tracker** is a full-stack web application designed for developers who want an accurate, private, and effortless record of their daily workflow. Whether you want to measure hours spent writing code, quantify time listening to focus music, or track project milestones, everything is visualized in a sleek dark-themed dashboard.

All data is stored locally on your machine with zero external cloud dependencies.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Realistic Machine Activity Tracking** | Automatically monitors the host machine in real-time (Linux/GNOME/Wayland/X11, Windows, macOS) |
| 🎵 **Active Media & MPRIS Detection** | Detects playing music/media metadata (title, artist, album) from Spotify, YouTube, Brave, etc. |
| 💤 **Smart Idle & User Activity Detection** | Accurately identifies user idle time using OS-level idle monitors (Mutter / X11 / Win32) |
| ⏱️ **Live Activity Stopwatch** | Real-time stopwatch with start/pause/save controls and smart auto-categorization |
| 📝 **Manual Activity Logging** | Easily log past work sessions, window titles, dates, durations, and notes |
| 📊 **Interactive Analytics** | Real-time Doughnut charts, 24-hour hourly timeline bars, and multi-day trend graphs |
| 🖥️ **Top Applications Ranking** | View your most-used IDEs, music players, and tools with visual distribution bars |
| 📅 **Flexible Date Filtering** | Filter dashboard metrics by Today, Yesterday, Last 7 Days, Last 30 Days, or Custom ranges |
| 🔍 **Search & Category Filters** | Filter activity logs by keyword, category (*Coding*, *Music*, *Work*, *Learning*, *Other*) |
| 🗄️ **Persistent Local Storage** | Atomic file-based JSON & SQLite storage that persists across sessions |
| 🪄 **Demo Data Generator** | One-click button to seed realistic activity logs across past days for instant preview |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide Icons, Chart.js, React-Chartjs-2
- **Backend & Tracker**: Node.js, Express.js, Native OS Introspection (D-Bus / MPRIS / Mutter / X11 / Win32), Morgan logger, CORS
- **Workspace Architecture**: Root npm workspaces linking `client/` and `server/` with `concurrently`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ or v22+ recommended)
- **npm**: v9.0.0 or higher

### 1. Install Dependencies

Clone the repository and install all dependencies for both frontend and backend in one step:

```bash
# Clone the repository
git clone https://github.com/frix-bena/mycoworker.git
cd mycowoker

# Install root, server, and client dependencies
npm install
```

### 2. Start Development Mode

Run the unified `dev` script to concurrently launch both the Express backend API and the Vite frontend:

```bash
npm run dev
```

- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

*(Vite automatically proxies `/api` requests to port 5000 during development).*

### 3. Production Build

To build the client and run the unified production server:

```bash
# Build optimized client static assets
npm run build

# Start production server (serves API & static frontend on port 5000)
npm start
```

---

## 📁 Project Structure

```
mycowoker/
├── package.json               # Root workspace orchestrator & dev scripts
├── .gitignore                 # Git ignore rules
├── README.md                  # Project documentation
│
├── server/                    # Express Backend
│   ├── package.json           # Server dependencies
│   ├── index.js               # Express server entry point & static fallback
│   ├── db.js                  # Persistent file store, category detector & sample seed
│   ├── routes/
│   │   ├── activities.js      # CRUD API routes (/api/activities)
│   │   └── stats.js           # Analytics & aggregation routes (/api/stats/summary)
│   └── data/
│       └── activities.json    # Local persistent activity database
│
└── client/                    # React + Vite Frontend
    ├── package.json           # Frontend dependencies
    ├── vite.config.js         # Vite configuration with /api proxy
    ├── tailwind.config.js     # Tailwind design system configuration
    ├── index.html             # HTML entry point
    └── src/
        ├── main.jsx           # React DOM root
        ├── App.jsx            # Main dashboard application layout & state
        ├── index.css          # Global styles & animations
        ├── components/
        │   ├── Navbar.jsx            # Header, live clock & action buttons
        │   ├── StatCards.jsx         # Metric summary cards
        │   ├── LiveTimer.jsx         # Live stopwatch tracker widget
        │   ├── ChartsSection.jsx     # Chart.js visualizations (Donut, Timeline, Daily)
        │   ├── TopAppsTable.jsx      # Top applications & tools ranking
        │   ├── ActivityList.jsx      # Activity log table with search & delete
        │   ├── ActivityFormModal.jsx # Add/edit manual activity modal
        │   └── DateRangeFilter.jsx   # Date range selector & search bar
        ├── services/
        │   └── api.js                # API client helper functions
        └── utils/
            └── formatters.js         # Duration, date, and category formatting helpers
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check and activity count |
| `GET` | `/api/tracker/status` | Current machine activity, active application, media playing, and idle state |
| `POST` | `/api/tracker/toggle` | Toggle automatic machine activity tracking on/off |
| `POST` | `/api/tracker/poll-now` | Force an immediate machine activity probe & database sync |
| `GET` | `/api/icons/:appName` | Stream authentic system application icon (PNG/SVG) from `.desktop` and icon theme paths |
| `GET` | `/api/icons/:appName/base64` | Retrieve base64 data URL of application icon |
| `GET` | `/api/icons/system/apps` | List all discovered system `.desktop` applications |
| `GET` | `/api/activities` | List activities (`?start=YYYY-MM-DD&end=YYYY-MM-DD&category=coding&search=term`) |
| `GET` | `/api/activities/:id` | Get single activity by ID |
| `POST` | `/api/activities` | Create a new activity entry |
| `PUT` | `/api/activities/:id` | Update an existing activity |
| `DELETE` | `/api/activities/:id` | Delete an activity by ID |
| `GET` | `/api/stats/summary` | Aggregate analytics metrics, category breakdown & timeline |
| `POST` | `/api/activities/seed` | Seed realistic demo activities across the past 7 days |
| `DELETE` | `/api/activities/clear/all` | Clear all activities |

---

## ⚙️ Configuration

Category mappings and auto-detection rules can be configured in [`server/db.js`](file:///home/frix/mycowoker/server/db.js#L20-L50):

```javascript
export const APP_CATEGORY_MAP = {
  'vscode': 'coding',
  'cursor': 'coding',
  'spotify': 'music',
  'chrome': 'work',
  // Add custom applications as needed
};
```

---

## 🔒 Privacy & Offline Guarantee

- **100% Offline**: No network traffic leaves your machine.
- **Local Storage**: All activity logs reside in `server/data/activities.json`.
- **Zero Cloud Sync**: Your workflow data is strictly private.

---

<div align="center">
  <b>Built with ❤️ for tracking your productivity</b>
</div>
