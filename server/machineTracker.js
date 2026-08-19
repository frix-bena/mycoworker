import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { db, detectCategory } from './db.js';

const execAsync = promisify(exec);

export class MachineTracker {
  constructor() {
    this.platform = os.platform(); // 'linux', 'win32', 'darwin'
    this.isTracking = true;
    this.pollIntervalMs = 3000; // Poll every 3 seconds
    this.idleThresholdSecs = 75; // 75 seconds of no user input -> idle
    this.timer = null;

    // Current tracking state
    this.currentActivity = null; // { id, appName, title, category, startTime, lastActiveTime, duration, notes }
    this.currentMedia = null; // { player, title, artist, album, isPlaying }
    this.lastIdleSeconds = 0;
    this.isIdle = false;
    this.lastPollTime = null;

    // Detection stats
    this.totalPolledCount = 0;
    this.lastDetectedRaw = null;
  }

  start() {
    if (this.timer) return;
    this.isTracking = true;
    console.log(`[MachineTracker] Started realistic machine activity tracker on ${this.platform} (interval: ${this.pollIntervalMs}ms)`);
    
    // Initial immediate probe
    this.poll();
    this.timer = setInterval(() => this.poll(), this.pollIntervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isTracking = false;
    // Finalize ongoing session
    if (this.currentActivity) {
      this._finalizeCurrentActivity();
    }
    console.log('[MachineTracker] Stopped machine activity tracker');
  }

  toggle() {
    if (this.isTracking) {
      this.stop();
    } else {
      this.start();
    }
    return this.isTracking;
  }

  async poll() {
    if (!this.isTracking) return null;
    this.totalPolledCount++;
    this.lastPollTime = new Date().toISOString();

    try {
      const probeResult = await this.detectActivity();
      this.lastDetectedRaw = probeResult;
      await this.processProbeResult(probeResult);
      return this.getStatus();
    } catch (err) {
      console.error('[MachineTracker] Error in polling loop:', err.message);
      return null;
    }
  }

  async detectActivity() {
    switch (this.platform) {
      case 'linux':
        return await this._detectLinux();
      case 'win32':
        return await this._detectWindows();
      case 'darwin':
        return await this._detectMacOS();
      default:
        return await this._detectGeneric();
    }
  }

  async _detectLinux() {
    let idleSeconds = 0;
    let activeWindow = null;
    let media = null;
    let topProcesses = [];

    // 1. Idle time via GNOME Mutter IdleMonitor or xprintidle
    try {
      const { stdout } = await execAsync('gdbus call --session --dest org.gnome.Mutter.IdleMonitor --object-path /org/gnome/Mutter/IdleMonitor/Core --method org.gnome.Mutter.IdleMonitor.GetIdletime');
      const m = stdout.match(/uint64\s+(\d+)/);
      if (m) idleSeconds = Math.round(parseInt(m[1], 10) / 1000);
    } catch (e) {
      try {
        const { stdout } = await execAsync('xprintidle');
        const ms = parseInt(stdout.trim(), 10);
        if (!isNaN(ms)) idleSeconds = Math.round(ms / 1000);
      } catch (e2) {}
    }

    // 2. Media via MPRIS (Spotify, Brave/Chrome/Firefox YouTube/Music, VLC, etc.)
    try {
      const { stdout } = await execAsync('busctl --user list');
      const mprisLines = stdout.split('\n').filter(l => l.includes('org.mpris.MediaPlayer2'));
      for (const line of mprisLines) {
        const busName = line.trim().split(/\s+/)[0];
        try {
          const { stdout: props } = await execAsync(`gdbus call --session --dest ${busName} --object-path /org/mpris/MediaPlayer2 --method org.freedesktop.DBus.Properties.GetAll org.mpris.MediaPlayer2.Player`);
          const statusMatch = props.match(/'PlaybackStatus':\s*<'([^']+)'/);
          const titleMatch = props.match(/'xesam:title':\s*<'([^']+)'/);
          const artistMatch = props.match(/'xesam:artist':\s*<\[(?:'([^']+)')?\]>/);
          const albumMatch = props.match(/'xesam:album':\s*<'([^']+)'/);

          if (statusMatch && statusMatch[1] === 'Playing') {
            const rawPlayer = busName.replace('org.mpris.MediaPlayer2.', '').split('.')[0];
            const playerFormatted = rawPlayer.charAt(0).toUpperCase() + rawPlayer.slice(1);
            media = {
              player: playerFormatted,
              title: titleMatch ? titleMatch[1] : 'Audio Playback',
              artist: artistMatch ? artistMatch[1] : '',
              album: albumMatch ? albumMatch[1] : '',
              isPlaying: true
            };
            break;
          }
        } catch (e) {}
      }
    } catch (e) {}

    // 3. Active Window via X11 / Xwayland
    try {
      let winId = null;
      try {
        const { stdout: rootOut } = await execAsync('xprop -root _NET_ACTIVE_WINDOW');
        const winMatch = rootOut.match(/window id # (0x[0-9a-fA-F]+)/);
        if (winMatch && winMatch[1] !== '0x0' && winMatch[1] !== '0x400003') {
          winId = winMatch[1];
        }
      } catch (e) {}

      // If active window not found or default root, check top window in stacking list
      if (!winId) {
        try {
          const { stdout: stackOut } = await execAsync('xprop -root _NET_CLIENT_LIST_STACKING');
          const stackMatch = stackOut.match(/window id # ([0-9a-fA-Fx,\s]+)/);
          if (stackMatch) {
            const ids = stackMatch[1].split(',').map(s => s.trim()).filter(Boolean);
            if (ids.length > 0) {
              winId = ids[ids.length - 1];
            }
          }
        } catch (e) {}
      }

      if (winId) {
        const { stdout: winProps } = await execAsync(`xprop -id ${winId} _NET_WM_NAME WM_NAME WM_CLASS _NET_WM_PID`);
        const nameMatch = winProps.match(/(?:_NET_WM_NAME|WM_NAME)\([^)]+\)\s*=\s*"([^"]+)"/);
        const classMatch = winProps.match(/WM_CLASS\([^)]+\)\s*=\s*"([^"]+)",\s*"([^"]+)"/);
        const pidMatch = winProps.match(/_NET_WM_PID\(CARDINAL\)\s*=\s*(\d+)/);

        if (nameMatch || classMatch) {
          const rawTitle = nameMatch ? nameMatch[1] : '';
          const rawClass = classMatch ? (classMatch[2] || classMatch[1]) : '';
          
          // Ignore desktop overlay backgrounds
          if (rawTitle && !['hidamari', 'Wayland to X Recording bridge', 'gnome-shell'].includes(rawTitle)) {
            activeWindow = {
              id: winId,
              title: rawTitle,
              wmClass: rawClass,
              pid: pidMatch ? parseInt(pidMatch[1], 10) : null
            };
          }
        }
      }
    } catch (e) {}

    // 4. Process inspection (detect active IDEs, terminals, browsers, apps)
    try {
      const { stdout: psOut } = await execAsync('ps -u $(whoami) -o pid,%cpu,comm,args --sort=-%cpu');
      const lines = psOut.split('\n').slice(1);
      
      let topEditor = null;
      let topBrowser = null;
      let topDev = null;
      let topOther = null;

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 4) continue;
        const cpu = parseFloat(parts[1]) || 0;
        const comm = parts[2];
        const args = parts.slice(3).join(' ');

        if (comm.includes('antigravity') || args.includes('antigravity')) {
          if (!topEditor || cpu > topEditor.cpu) {
            topEditor = { name: 'Antigravity', title: 'Antigravity IDE — Agentic Coding', category: 'coding', cpu };
          }
        } else if (comm === 'code' || args.includes('/usr/share/code/code')) {
          if (!topEditor || cpu > topEditor.cpu) {
            topEditor = { name: 'Visual Studio Code', title: 'Visual Studio Code', category: 'coding', cpu };
          }
        } else if (comm.includes('cursor') || args.includes('cursor')) {
          if (!topEditor || cpu > topEditor.cpu) {
            topEditor = { name: 'Cursor', title: 'Cursor AI Editor', category: 'coding', cpu };
          }
        } else if (['brave', 'chrome', 'firefox', 'zen'].some(b => comm.includes(b) || args.includes(b))) {
          if (!topBrowser || cpu > topBrowser.cpu) {
            const bName = comm.includes('brave') ? 'Brave Browser' : comm.includes('chrome') ? 'Google Chrome' : 'Firefox';
            topBrowser = { name: bName, title: `${bName} — Web Browsing`, category: 'work', cpu };
          }
        } else if (['claude', 'slack', 'discord', 'notion', 'figma'].some(a => comm.includes(a) || args.includes(a))) {
          if (!topOther || cpu > topOther.cpu) {
            const aName = comm.charAt(0).toUpperCase() + comm.slice(1);
            topOther = { name: aName, title: `${aName} Application`, category: 'work', cpu };
          }
        } else if (['node', 'python', 'npm', 'cargo', 'git', 'docker', 'bash'].some(d => comm === d)) {
          if (!topDev || cpu > topDev.cpu) {
            topDev = { name: 'Terminal', title: `Terminal — ${comm}`, category: 'coding', cpu };
          }
        }
      }

      topProcesses = [topEditor, topBrowser, topOther, topDev].filter(Boolean);
    } catch (e) {}

    // Resolve active app, title, and category
    let appName = null;
    let windowTitle = null;
    let category = 'other';
    let notes = '';

    if (activeWindow && activeWindow.title) {
      appName = this._formatAppName(activeWindow.wmClass || activeWindow.title);
      windowTitle = activeWindow.title;
      category = detectCategory(appName, windowTitle);
    } else if (media && media.isPlaying) {
      appName = media.player || 'Music Player';
      windowTitle = `${media.artist ? media.artist + ' - ' : ''}${media.title}`;
      category = 'music';
      notes = `Playing on ${media.player}${media.album ? ` (${media.album})` : ''}`;
    } else if (topProcesses.length > 0) {
      const top = topProcesses[0];
      appName = top.name;
      windowTitle = top.title;
      category = top.category;
    } else {
      appName = 'System Workspace';
      windowTitle = 'Desktop Activity';
      category = 'other';
    }

    // Enhance notes if media is playing in background while coding/working
    if (media && media.isPlaying && category !== 'music') {
      notes = `Background Music: ${media.artist ? media.artist + ' - ' : ''}${media.title}`;
    }

    return {
      appName,
      windowTitle,
      category,
      idleSeconds,
      isIdle: idleSeconds > this.idleThresholdSecs,
      media,
      notes
    };
  }

  async _detectWindows() {
    let idleSeconds = 0;
    let appName = 'System';
    let windowTitle = 'Windows Desktop';
    let category = 'other';

    try {
      const psScript = `
        Add-Type @"
          using System;
          using System.Runtime.InteropServices;
          using System.Text;
          public class WinUtil {
            [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
            [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
            [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
            [StructLayout(LayoutKind.Sequential)] public struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }
            [DllImport("user32.dll")] public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
            public static uint GetIdle() {
              LASTINPUTINFO lii = new LASTINPUTINFO();
              lii.cbSize = (uint)Marshal.SizeOf(lii);
              if (GetLastInputInfo(ref lii)) {
                return ((uint)Environment.TickCount - lii.dwTime) / 1000;
              }
              return 0;
            }
          }
"@
        $hwnd = [WinUtil]::GetForegroundWindow()
        $sb = New-Object System.Text.StringBuilder 256
        [WinUtil]::GetWindowText($hwnd, $sb, 256) | Out-Null
        $title = $sb.ToString()
        $pid = 0
        [WinUtil]::GetWindowThreadProcessId($hwnd, [ref]$pid) | Out-Null
        $proc = if ($pid -gt 0) { (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName } else { "" }
        $idle = [WinUtil]::GetIdle()
        @{ App = $proc; Title = $title; Idle = $idle } | ConvertTo-Json -Compress
      `;

      const { stdout } = await execAsync(`powershell -NoProfile -NonInteractive -Command "${psScript.replace(/\n/g, ' ')}"`);
      const parsed = JSON.parse(stdout.trim());
      if (parsed) {
        appName = this._formatAppName(parsed.App || 'Windows App');
        windowTitle = parsed.Title || appName;
        idleSeconds = parseInt(parsed.Idle, 10) || 0;
        category = detectCategory(appName, windowTitle);
      }
    } catch (e) {
      appName = 'Windows Desktop';
      windowTitle = 'System Workspace';
    }

    return {
      appName,
      windowTitle,
      category,
      idleSeconds,
      isIdle: idleSeconds > this.idleThresholdSecs,
      media: null,
      notes: ''
    };
  }

  async _detectMacOS() {
    let appName = 'macOS';
    let windowTitle = 'Desktop';
    let category = 'other';
    let idleSeconds = 0;

    try {
      const { stdout } = await execAsync(`osascript -e 'tell application "System Events" to get {name, title} of first application process whose frontmost is true'`);
      const parts = stdout.trim().split(', ');
      if (parts.length > 0) {
        appName = this._formatAppName(parts[0]);
        windowTitle = parts[1] || appName;
        category = detectCategory(appName, windowTitle);
      }
    } catch (e) {}

    try {
      const { stdout: idleOut } = await execAsync(`ioreg -c IOHIDSystem | awk '/HIDIdleTime/ {print int($NF/1000000000); exit}'`);
      idleSeconds = parseInt(idleOut.trim(), 10) || 0;
    } catch (e) {}

    return {
      appName,
      windowTitle,
      category,
      idleSeconds,
      isIdle: idleSeconds > this.idleThresholdSecs,
      media: null,
      notes: ''
    };
  }

  async _detectGeneric() {
    return {
      appName: 'Local Machine',
      windowTitle: 'Active Workspace',
      category: 'work',
      idleSeconds: 0,
      isIdle: false,
      media: null,
      notes: ''
    };
  }

  _formatAppName(rawName) {
    if (!rawName) return 'Application';
    const lower = rawName.toLowerCase();
    if (lower.includes('antigravity')) return 'Antigravity';
    if (lower.includes('code') || lower.includes('vscode')) return 'Visual Studio Code';
    if (lower.includes('cursor')) return 'Cursor';
    if (lower.includes('brave')) return 'Brave';
    if (lower.includes('chrome')) return 'Google Chrome';
    if (lower.includes('firefox')) return 'Firefox';
    if (lower.includes('spotify')) return 'Spotify';
    if (lower.includes('claude')) return 'Claude';
    if (lower.includes('slack')) return 'Slack';
    if (lower.includes('discord')) return 'Discord';
    if (lower.includes('notion')) return 'Notion';
    if (lower.includes('terminal') || lower.includes('ptyxis') || lower.includes('bash')) return 'Terminal';
    return rawName.charAt(0).toUpperCase() + rawName.slice(1);
  }

  async processProbeResult(probe) {
    this.lastIdleSeconds = probe.idleSeconds || 0;
    this.isIdle = probe.isIdle;
    this.currentMedia = probe.media || null;

    const now = new Date();

    // If user is idle and no active media is playing, finalize current activity
    if (probe.isIdle && (!probe.media || !probe.media.isPlaying)) {
      if (this.currentActivity) {
        await this._finalizeCurrentActivity();
      }
      return;
    }

    const appName = probe.appName;
    const windowTitle = probe.windowTitle;
    const category = probe.category;
    const notes = probe.notes || '';

    // Check if continuing same activity session
    if (this.currentActivity && this.currentActivity.appName === appName && this.currentActivity.category === category) {
      // Accumulate time in current session
      const startTime = new Date(this.currentActivity.startTime);
      const currentDurationSecs = Math.max(1, Math.round((now.getTime() - startTime.getTime()) / 1000));

      this.currentActivity.duration = currentDurationSecs;
      this.currentActivity.lastActiveTime = now.toISOString();
      this.currentActivity.title = windowTitle || this.currentActivity.title;
      this.currentActivity.notes = notes || this.currentActivity.notes;

      // Update in db periodically (every ~6 seconds)
      if (this.totalPolledCount % 2 === 0) {
        await db.update(this.currentActivity.id, {
          duration: currentDurationSecs,
          endTime: now.toISOString(),
          title: this.currentActivity.title,
          notes: this.currentActivity.notes
        });
      }
    } else {
      // Activity changed: finalize existing activity
      if (this.currentActivity) {
        await this._finalizeCurrentActivity();
      }

      // Create new activity entry in database
      const newEntry = await db.create({
        appName,
        title: windowTitle,
        category,
        duration: Math.round(this.pollIntervalMs / 1000),
        startTime: now.toISOString(),
        endTime: new Date(now.getTime() + this.pollIntervalMs).toISOString(),
        notes
      });

      this.currentActivity = {
        id: newEntry.id,
        appName: newEntry.appName,
        title: newEntry.title,
        category: newEntry.category,
        startTime: newEntry.startTime,
        lastActiveTime: now.toISOString(),
        duration: newEntry.duration,
        notes: newEntry.notes
      };

      console.log(`[MachineTracker] Started tracking: [${category.toUpperCase()}] ${appName} - "${windowTitle}"`);
    }
  }

  async _finalizeCurrentActivity() {
    if (!this.currentActivity) return;
    try {
      const now = new Date();
      const startTime = new Date(this.currentActivity.startTime);
      const totalSecs = Math.max(1, Math.round((now.getTime() - startTime.getTime()) / 1000));

      await db.update(this.currentActivity.id, {
        duration: totalSecs,
        endTime: now.toISOString()
      });

      console.log(`[MachineTracker] Finalized session: ${this.currentActivity.appName} (${totalSecs}s)`);
    } catch (e) {
      console.error('[MachineTracker] Error finalizing activity:', e.message);
    } finally {
      this.currentActivity = null;
    }
  }

  getStatus() {
    return {
      isTracking: this.isTracking,
      platform: this.platform,
      pollIntervalMs: this.pollIntervalMs,
      idleThresholdSecs: this.idleThresholdSecs,
      idleSeconds: this.lastIdleSeconds,
      isIdle: this.isIdle,
      currentActivity: this.currentActivity ? {
        ...this.currentActivity,
        liveDuration: this.currentActivity.startTime
          ? Math.max(1, Math.round((Date.now() - new Date(this.currentActivity.startTime).getTime()) / 1000))
          : this.currentActivity.duration
      } : null,
      media: this.currentMedia,
      lastPollTime: this.lastPollTime,
      totalPolledCount: this.totalPolledCount
    };
  }
}

export const machineTracker = new MachineTracker();
