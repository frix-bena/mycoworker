import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'activities.json');

// Category definitions & metadata
export const CATEGORIES = {
  coding: { name: 'Coding', icon: '⌨️', color: '#38bdf8' },
  music: { name: 'Music / Media', icon: '🎵', color: '#a78bfa' },
  work: { name: 'Work / Docs', icon: '💼', color: '#34d399' },
  study: { name: 'Learning / Research', icon: '📚', color: '#f59e0b' },
  other: { name: 'Other', icon: '◈', color: '#94a3b8' }
};

// Common apps mapped to categories
export const APP_CATEGORY_MAP = {
  // IDEs & Code Editors
  'antigravity': 'coding',
  'antigravity ide': 'coding',
  'vscode': 'coding',
  'visual studio code': 'coding',
  'code': 'coding',
  'code-oss': 'coding',
  'vscodium': 'coding',
  'cursor': 'coding',
  'windsurf': 'coding',
  'positron': 'coding',
  'zed': 'coding',
  'zed-editor': 'coding',
  'pycharm': 'coding',
  'intellij': 'coding',
  'intellij idea': 'coding',
  'idea': 'coding',
  'webstorm': 'coding',
  'clion': 'coding',
  'rider': 'coding',
  'jetbrains rider': 'coding',
  'goland': 'coding',
  'android studio': 'coding',
  'androidstudio': 'coding',
  'phpstorm': 'coding',
  'rubymine': 'coding',
  'rustrover': 'coding',
  'datagrip': 'coding',
  'fleet': 'coding',
  'sublime text': 'coding',
  'sublime': 'coding',
  'neovim': 'coding',
  'nvim': 'coding',
  'vim': 'coding',
  'gvim': 'coding',
  'macvim': 'coding',
  'emacs': 'coding',
  'emacsclient': 'coding',
  'eclipse': 'coding',
  'netbeans': 'coding',
  'devenv': 'coding',
  'visual studio': 'coding',
  'xcode': 'coding',
  'helix': 'coding',
  'kate': 'coding',

  // Terminal & Shells
  'terminal': 'coding',
  'ptyxis': 'coding',
  'alacritty': 'coding',
  'kitty': 'coding',
  'wezterm': 'coding',
  'iterm': 'coding',
  'iterm2': 'coding',
  'hyper': 'coding',
  'warp': 'coding',
  'bash': 'coding',
  'zsh': 'coding',
  'fish': 'coding',
  'tmux': 'coding',
  'git': 'coding',
  'github desktop': 'coding',
  'gitkraken': 'coding',
  'sourcetree': 'coding',
  'postman': 'coding',
  'insomnia': 'coding',
  'docker': 'coding',
  'docker desktop': 'coding',
  
  // Music & Media
  'spotify': 'music',
  'apple music': 'music',
  'youtube music': 'music',
  'youtube': 'music',
  'vlc': 'music',
  'amberol': 'music',
  'rhythmbox': 'music',
  'soundcloud': 'music',
  'tidal': 'music',
  'deezer': 'music',
  'winamp': 'music',
  'foobar2000': 'music',
  'musicbee': 'music',
  'itunes': 'music',
  'podcast': 'music',
  'audible': 'music',

  // Browsers & Research
  'chrome': 'work',
  'google chrome': 'work',
  'firefox': 'work',
  'brave': 'work',
  'zen': 'work',
  'safari': 'work',
  'edge': 'work',
  'microsoft edge': 'work',
  'chromium': 'work',
  'arc': 'work',
  'opera': 'work',
  'vivaldi': 'work',

  // AI & Study
  'claude': 'work',
  'chatgpt': 'study',
  'gemini': 'study',
  'deepseek': 'study',
  'perplexity': 'study',
  'obsidian': 'study',
  'notion': 'work',
  'anki': 'study',
  'logseq': 'study',

  // Communication & Productivity
  'slack': 'work',
  'discord': 'work',
  'teams': 'work',
  'microsoft teams': 'work',
  'telegram': 'work',
  'zoom': 'work',
  'figma': 'work',
  'jira': 'work',
  'linear': 'work',
  'trello': 'work'
};

export function detectCategory(appName, title = '') {
  const target = `${appName} ${title}`.toLowerCase();
  
  if (
    target.includes('github') || 
    target.includes('gitlab') || 
    target.includes('stackoverflow') || 
    target.includes('stack overflow') || 
    target.includes('localhost') || 
    target.includes('127.0.0.1') ||
    target.includes('.js') ||
    target.includes('.jsx') ||
    target.includes('.ts') ||
    target.includes('.tsx') ||
    target.includes('.py') ||
    target.includes('.rs') ||
    target.includes('.go') ||
    target.includes('.cpp') ||
    target.includes('.c') ||
    target.includes('.java') ||
    target.includes('.html') ||
    target.includes('.css') ||
    target.includes('workspace') ||
    target.includes('.json')
  ) {
    return 'coding';
  }

  for (const [key, category] of Object.entries(APP_CATEGORY_MAP)) {
    if (target.includes(key)) {
      return category;
    }
  }
  return 'other';
}

class ActivityStore {
  constructor() {
    this.initialized = false;
  }

  async init() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      try {
        const content = await fs.readFile(DATA_FILE, 'utf-8');
        const data = JSON.parse(content);
        if (!Array.isArray(data)) {
          await this._writeData([]);
        }
      } catch (err) {
        // File doesn't exist or is invalid JSON - start with clean empty array
        await this._writeData([]);
      }
      this.initialized = true;
    } catch (err) {
      console.error('Error initializing ActivityStore:', err);
    }
  }

  async _readData() {
    try {
      const content = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      return [];
    }
  }

  async _writeData(data) {
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempFile, DATA_FILE);
  }

  async getAll({ start, end, category, search, limit } = {}) {
    let activities = await this._readData();

    if (start) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      activities = activities.filter(a => new Date(a.startTime) >= startDate);
    }

    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      activities = activities.filter(a => new Date(a.startTime) <= endDate);
    }

    if (category && category !== 'all') {
      activities = activities.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      activities = activities.filter(a => 
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.appName && a.appName.toLowerCase().includes(q)) ||
        (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    activities.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    if (limit && Number.isInteger(Number(limit))) {
      activities = activities.slice(0, Number(limit));
    }

    return activities;
  }

  async getById(id) {
    const activities = await this._readData();
    return activities.find(a => a.id === id) || null;
  }

  async create(data) {
    const activities = await this._readData();
    const now = new Date();
    
    let startTime = data.startTime ? new Date(data.startTime) : now;
    let duration = Number(data.duration) || 0;
    let endTime = data.endTime ? new Date(data.endTime) : new Date(startTime.getTime() + duration * 1000);

    if (data.startTime && data.endTime && !data.duration) {
      duration = Math.max(0, Math.round((new Date(data.endTime) - new Date(data.startTime)) / 1000));
    }

    const category = data.category || detectCategory(data.appName || '', data.title || '');

    const newActivity = {
      id: crypto.randomUUID(),
      title: (data.title || data.appName || 'Untitled Activity').trim(),
      appName: (data.appName || 'Custom Task').trim(),
      category,
      duration, // in seconds
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      notes: data.notes ? data.notes.trim() : '',
      workspace: data.workspace ? data.workspace.trim() : null,
      gitBranch: data.gitBranch ? data.gitBranch.trim() : null,
      file: data.file ? data.file.trim() : null,
      ideName: data.ideName ? data.ideName.trim() : (category === 'coding' ? (data.appName || null) : null),
      createdAt: now.toISOString()
    };

    activities.unshift(newActivity);
    await this._writeData(activities);
    return newActivity;
  }

  async update(id, data) {
    const activities = await this._readData();
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) return null;

    const existing = activities[index];
    let startTime = data.startTime ? new Date(data.startTime).toISOString() : existing.startTime;
    let duration = data.duration !== undefined ? Number(data.duration) : existing.duration;
    let endTime = data.endTime ? new Date(data.endTime).toISOString() : 
      new Date(new Date(startTime).getTime() + duration * 1000).toISOString();

    const updated = {
      ...existing,
      title: data.title !== undefined ? data.title.trim() : existing.title,
      appName: data.appName !== undefined ? data.appName.trim() : existing.appName,
      category: data.category || existing.category,
      duration,
      startTime,
      endTime,
      notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
      workspace: data.workspace !== undefined ? (data.workspace ? data.workspace.trim() : null) : existing.workspace,
      gitBranch: data.gitBranch !== undefined ? (data.gitBranch ? data.gitBranch.trim() : null) : existing.gitBranch,
      file: data.file !== undefined ? (data.file ? data.file.trim() : null) : existing.file,
      ideName: data.ideName !== undefined ? (data.ideName ? data.ideName.trim() : null) : existing.ideName,
      updatedAt: new Date().toISOString()
    };

    activities[index] = updated;
    await this._writeData(activities);
    return updated;
  }

  async delete(id) {
    const activities = await this._readData();
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) return false;

    activities.splice(index, 1);
    await this._writeData(activities);
    return true;
  }

  async clearAll() {
    await this._writeData([]);
    return true;
  }

  async getSummary({ start, end } = {}) {
    const activities = await this.getAll({ start, end });
    
    // Category totals
    const categoryTotals = {
      coding: 0,
      music: 0,
      work: 0,
      study: 0,
      other: 0
    };

    const categoryCounts = {
      coding: 0,
      music: 0,
      work: 0,
      study: 0,
      other: 0
    };

    // App totals
    const appMap = new Map();

    // IDE breakdown & Workspace breakdown
    const ideMap = new Map();
    const workspaceMap = new Map();

    // Hourly buckets (00:00 - 23:00)
    const hourlyMap = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      coding: 0,
      music: 0,
      work: 0,
      study: 0,
      other: 0,
      total: 0
    }));

    // Daily totals map (YYYY-MM-DD)
    const dailyMap = new Map();

    // Determine start & end dates
    const today = new Date();
    const endDt = end ? new Date(end) : today;
    const startDt = start ? new Date(start) : new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    
    // Populate dailyMap with all dates in range
    const cur = new Date(startDt);
    cur.setHours(0, 0, 0, 0);
    const endLimit = new Date(endDt);
    endLimit.setHours(23, 59, 59, 999);

    while (cur <= endLimit) {
      const dateKey = cur.toISOString().slice(0, 10);
      dailyMap.set(dateKey, {
        date: dateKey,
        displayDate: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        coding: 0,
        music: 0,
        work: 0,
        study: 0,
        other: 0,
        total: 0
      });
      cur.setDate(cur.getDate() + 1);
    }

    let totalDuration = 0;

    for (const act of activities) {
      const dur = act.duration || 0;
      totalDuration += dur;
      const cat = (act.category || 'other').toLowerCase();

      if (categoryTotals[cat] !== undefined) {
        categoryTotals[cat] += dur;
        categoryCounts[cat] += 1;
      } else {
        categoryTotals.other += dur;
        categoryCounts.other += 1;
      }

      // App stats
      const appName = act.appName || 'Unknown';
      if (!appMap.has(appName)) {
        appMap.set(appName, {
          name: appName,
          category: act.category || 'other',
          duration: 0,
          count: 0
        });
      }
      const appEntry = appMap.get(appName);
      appEntry.duration += dur;
      appEntry.count += 1;

      // IDE & Coding Breakdown
      if (cat === 'coding') {
        const ideName = act.ideName || act.appName || 'General IDE';
        if (!ideMap.has(ideName)) {
          ideMap.set(ideName, { name: ideName, duration: 0, count: 0 });
        }
        const ideEntry = ideMap.get(ideName);
        ideEntry.duration += dur;
        ideEntry.count += 1;

        // Workspace breakdown
        const ws = act.workspace || (act.title && act.title.includes('—') ? act.title.split('—')[0].trim() : 'Default Workspace');
        if (ws) {
          if (!workspaceMap.has(ws)) {
            workspaceMap.set(ws, { name: ws, duration: 0, count: 0, ide: ideName });
          }
          const wsEntry = workspaceMap.get(ws);
          wsEntry.duration += dur;
          wsEntry.count += 1;
        }
      }

      // Hourly stats
      const actDate = new Date(act.startTime);
      const hourIndex = actDate.getHours();
      if (hourlyMap[hourIndex]) {
        if (hourlyMap[hourIndex][cat] !== undefined) {
          hourlyMap[hourIndex][cat] += dur;
        } else {
          hourlyMap[hourIndex].other += dur;
        }
        hourlyMap[hourIndex].total += dur;
      }

      // Daily stats
      const dateKey = act.startTime.slice(0, 10);
      if (dailyMap.has(dateKey)) {
        const dEntry = dailyMap.get(dateKey);
        if (dEntry[cat] !== undefined) {
          dEntry[cat] += dur;
        } else {
          dEntry.other += dur;
        }
        dEntry.total += dur;
      }
    }

    // Format top apps
    const topApps = Array.from(appMap.values())
      .sort((a, b) => b.duration - a.duration)
      .map((app, idx) => ({
        ...app,
        rank: idx + 1,
        percentage: totalDuration > 0 ? Math.round((app.duration / totalDuration) * 100) : 0,
        iconUrl: `/api/icons/${encodeURIComponent(app.name)}`
      }));

    // Format IDE breakdown
    const codingTotal = categoryTotals.coding || 1;
    const ideBreakdown = Array.from(ideMap.values())
      .sort((a, b) => b.duration - a.duration)
      .map((ide, idx) => ({
        ...ide,
        rank: idx + 1,
        percentage: codingTotal > 0 ? Math.round((ide.duration / codingTotal) * 100) : 0
      }));

    // Format Workspace breakdown
    const workspaceBreakdown = Array.from(workspaceMap.values())
      .sort((a, b) => b.duration - a.duration)
      .map((ws, idx) => ({
        ...ws,
        rank: idx + 1,
        percentage: codingTotal > 0 ? Math.round((ws.duration / codingTotal) * 100) : 0
      }));

    const numDays = Math.max(1, dailyMap.size);

    return {
      totalDuration,
      totalActivities: activities.length,
      averageDailyDuration: Math.round(totalDuration / numDays),
      daysCount: numDays,
      categoryTotals,
      categoryCounts,
      topApps,
      ideBreakdown,
      workspaceBreakdown,
      codingStats: {
        totalCodingDuration: categoryTotals.coding,
        totalCodingSessions: categoryCounts.coding,
        topIde: ideBreakdown[0]?.name || null,
        topWorkspace: workspaceBreakdown[0]?.name || null,
        activeProjectsCount: workspaceBreakdown.length,
        ideBreakdown,
        workspaceBreakdown
      },
      hourlyTimeline: hourlyMap,
      dailyTrend: Array.from(dailyMap.values()),
      dateRange: {
        start: startDt.toISOString().slice(0, 10),
        end: endDt.toISOString().slice(0, 10)
      }
    };
  }

  async seedSampleData() {
    const apps = [
      { name: 'Antigravity', title: 'mycowoker — LiveMachineTracker.jsx (main)', cat: 'coding', workspace: 'mycowoker', gitBranch: 'main', file: 'LiveMachineTracker.jsx', notes: 'Integrated real-time IDE activity detection across running editors' },
      { name: 'Antigravity', title: 'autoscroll — background.js', cat: 'coding', workspace: 'autoscroll', gitBranch: 'master', file: 'background.js', notes: 'Tested Chrome extension auto-scrolling worker' },
      { name: 'Visual Studio Code', title: 'mycowoker — server.js (main)', cat: 'coding', workspace: 'mycowoker', gitBranch: 'main', file: 'server.js', notes: 'Implemented REST endpoints and SQLite/JSON storage layer' },
      { name: 'WebStorm', title: 'mycowoker — App.jsx (main)', cat: 'coding', workspace: 'mycowoker', gitBranch: 'main', file: 'App.jsx', notes: 'Configured React components and state management' },
      { name: 'Terminal', title: 'npm run dev — vite & express', cat: 'coding', workspace: 'mycowoker', gitBranch: 'main', file: 'package.json', notes: 'Testing dev script and build outputs' },
      { name: 'Claude', title: 'Architecting local-first activity detection', cat: 'work', notes: 'Discussed process introspection and MPRIS media detection' },
      { name: 'Brave Browser', title: 'MDN Web Docs & Tailwind Documentation', cat: 'work', notes: 'Researched React hooks and Tailwind grid layouts' }
    ];

    const sampleActivities = [];
    const now = new Date();

    // Generate across past 7 days
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const baseDate = new Date(now);
      baseDate.setDate(baseDate.getDate() - dayOffset);
      
      // 4 to 7 activities per day
      const dailyCount = 4 + Math.floor(Math.random() * 4);
      let currentHour = 9; // Start at 9 AM

      for (let i = 0; i < dailyCount; i++) {
        const app = apps[Math.floor(Math.random() * apps.length)];
        const durationMins = 20 + Math.floor(Math.random() * 70); // 20 - 90 mins
        const durationSecs = durationMins * 60;

        const startTime = new Date(baseDate);
        startTime.setHours(currentHour, Math.floor(Math.random() * 30), 0, 0);
        const endTime = new Date(startTime.getTime() + durationSecs * 1000);

        sampleActivities.push({
          id: crypto.randomUUID(),
          title: app.title,
          appName: app.name,
          category: app.cat,
          duration: durationSecs,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          workspace: app.workspace || null,
          gitBranch: app.gitBranch || null,
          file: app.file || null,
          ideName: app.cat === 'coding' ? app.name : null,
          notes: app.notes,
          createdAt: startTime.toISOString()
        });

        currentHour += Math.floor(durationMins / 60) + 1;
        if (currentHour >= 22) break;
      }
    }

    await this._writeData(sampleActivities);
    return sampleActivities;
  }
}

export const db = new ActivityStore();
