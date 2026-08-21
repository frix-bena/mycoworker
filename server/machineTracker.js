import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { db, detectCategory } from './db.js';
import { iconResolver } from './iconResolver.js';

const execAsync = promisify(exec);

// Complete IDE & Code Editor Definitions
export const IDE_DEFINITIONS = [
  {
    key: 'antigravity',
    name: 'Antigravity',
    aliases: ['antigravity', 'antigravity-cli', 'cloudcode_cli', 'language_server_linux_x64'],
    configDirs: [
      path.join(os.homedir(), '.config/Antigravity'),
      path.join(os.homedir(), 'Library/Application Support/Antigravity'),
      path.join(process.env.APPDATA || '', 'Antigravity')
    ]
  },
  {
    key: 'vscode',
    name: 'Visual Studio Code',
    aliases: ['code', 'vscode', 'code-oss', 'vscodium', 'visual studio code'],
    configDirs: [
      path.join(os.homedir(), '.config/Code'),
      path.join(os.homedir(), '.config/VSCodium'),
      path.join(os.homedir(), 'Library/Application Support/Code'),
      path.join(process.env.APPDATA || '', 'Code')
    ]
  },
  {
    key: 'cursor',
    name: 'Cursor',
    aliases: ['cursor', 'cursor-server', 'anysphere'],
    configDirs: [
      path.join(os.homedir(), '.config/Cursor'),
      path.join(os.homedir(), 'Library/Application Support/Cursor'),
      path.join(process.env.APPDATA || '', 'Cursor')
    ]
  },
  {
    key: 'windsurf',
    name: 'Windsurf',
    aliases: ['windsurf', 'codeium'],
    configDirs: [
      path.join(os.homedir(), '.config/Windsurf'),
      path.join(os.homedir(), 'Library/Application Support/Windsurf'),
      path.join(process.env.APPDATA || '', 'Windsurf')
    ]
  },
  {
    key: 'positron',
    name: 'Positron',
    aliases: ['positron'],
    configDirs: [
      path.join(os.homedir(), '.config/Positron'),
      path.join(os.homedir(), 'Library/Application Support/Positron'),
      path.join(process.env.APPDATA || '', 'Positron')
    ]
  },
  {
    key: 'zed',
    name: 'Zed',
    aliases: ['zed', 'zed-editor'],
    configDirs: [
      path.join(os.homedir(), '.config/zed'),
      path.join(os.homedir(), 'Library/Application Support/Zed')
    ]
  },
  {
    key: 'pycharm',
    name: 'PyCharm',
    aliases: ['pycharm', 'pycharm64', 'pycharm-community', 'pycharm-professional'],
    configDirs: [
      path.join(os.homedir(), '.config/JetBrains'),
      path.join(os.homedir(), 'Library/Application Support/JetBrains')
    ]
  },
  {
    key: 'intellij',
    name: 'IntelliJ IDEA',
    aliases: ['idea', 'idea64', 'intellij', 'idea-community', 'idea-ultimate'],
    configDirs: [
      path.join(os.homedir(), '.config/JetBrains'),
      path.join(os.homedir(), 'Library/Application Support/JetBrains')
    ]
  },
  {
    key: 'webstorm',
    name: 'WebStorm',
    aliases: ['webstorm', 'webstorm64'],
    configDirs: [
      path.join(os.homedir(), '.config/JetBrains'),
      path.join(os.homedir(), 'Library/Application Support/JetBrains')
    ]
  },
  {
    key: 'clion',
    name: 'CLion',
    aliases: ['clion', 'clion64'],
    configDirs: [
      path.join(os.homedir(), '.config/JetBrains'),
      path.join(os.homedir(), 'Library/Application Support/JetBrains')
    ]
  },
  {
    key: 'rider',
    name: 'JetBrains Rider',
    aliases: ['rider', 'rider64'],
    configDirs: [
      path.join(os.homedir(), '.config/JetBrains'),
      path.join(os.homedir(), 'Library/Application Support/JetBrains')
    ]
  },
  {
    key: 'goland',
    name: 'GoLand',
    aliases: ['goland', 'goland64'],
    configDirs: [
      path.join(os.homedir(), '.config/JetBrains'),
      path.join(os.homedir(), 'Library/Application Support/JetBrains')
    ]
  },
  {
    key: 'androidstudio',
    name: 'Android Studio',
    aliases: ['studio', 'studio64', 'android-studio'],
    configDirs: [
      path.join(os.homedir(), '.config/Google/AndroidStudio'),
      path.join(os.homedir(), 'Library/Application Support/Google/AndroidStudio')
    ]
  },
  {
    key: 'sublime',
    name: 'Sublime Text',
    aliases: ['sublime_text', 'sublime', 'subl'],
    configDirs: [
      path.join(os.homedir(), '.config/sublime-text'),
      path.join(os.homedir(), 'Library/Application Support/Sublime Text')
    ]
  },
  {
    key: 'neovim',
    name: 'Neovim',
    aliases: ['nvim', 'neovim'],
    configDirs: [path.join(os.homedir(), '.config/nvim')]
  },
  {
    key: 'vim',
    name: 'Vim',
    aliases: ['vim', 'gvim', 'mvim'],
    configDirs: []
  },
  {
    key: 'emacs',
    name: 'Emacs',
    aliases: ['emacs', 'emacsclient'],
    configDirs: [path.join(os.homedir(), '.emacs.d')]
  }
];

function getGitBranch(dirPath) {
  if (!dirPath || typeof dirPath !== 'string') return null;
  try {
    const gitHead = path.join(dirPath, '.git', 'HEAD');
    if (fs.existsSync(gitHead)) {
      const content = fs.readFileSync(gitHead, 'utf-8').trim();
      const m = content.match(/^ref: refs\/heads\/(.+)$/);
      return m ? m[1] : content.slice(0, 7);
    }
  } catch (e) {}
  return null;
}

function cleanProjectName(folderPath) {
  if (!folderPath || typeof folderPath !== 'string') return null;
  const basename = path.basename(folderPath);
  if (basename && basename !== '.' && basename !== '/') {
    return basename.replace(/\.code-workspace$/, '');
  }
  return folderPath;
}

export class MachineTracker {
  constructor() {
    this.platform = os.platform(); // 'linux', 'win32', 'darwin'
    this.sessionType = (process.env.XDG_SESSION_TYPE || 'x11').toLowerCase(); // 'wayland', 'x11'
    this.desktopEnvironment = (process.env.XDG_CURRENT_DESKTOP || process.env.DESKTOP_SESSION || '').toLowerCase();
    this.isTracking = true;
    this.pollIntervalMs = 1500; // Poll every 1.5 seconds
    this.idleThresholdSecs = 75; // 75 seconds of no user input -> idle
    this.timer = null;

    // Current tracking state
    this.currentActivity = null; // { id, appName, title, category, workspace, gitBranch, file, ideName, duration, notes, iconUrl }
    this.currentMedia = null; // { player, title, artist, album, isPlaying }
    this.activeIDEs = []; // [{ name, iconKey, isActive, processCount, workspaces, currentWorkspace, currentFile, gitBranch, lastActiveSecs }]
    this.primaryActiveIDE = null;
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
    console.log(`[MachineTracker] Started machine & application activity tracker on ${this.platform} (${this.sessionType}/${this.desktopEnvironment}) interval: ${this.pollIntervalMs}ms`);
    
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

  /**
   * Introspects running processes and config states to detect active IDEs
   */
  async _inspectRunningIDEs() {
    const detectedIDEs = new Map();
    const now = Date.now();

    // 1. Inspect running processes via ps
    let psLines = [];
    try {
      const { stdout } = await execAsync('ps -eo pid,ppid,args --no-headers');
      psLines = stdout.split('\n').filter(Boolean);
    } catch (e) {}

    // Check active pts devices (terminals) modified in the last 60 seconds
    const activePtsList = new Set();
    try {
      const ptsFiles = fs.readdirSync('/dev/pts');
      for (const pts of ptsFiles) {
        if (/^\d+$/.test(pts)) {
          const fullPath = `/dev/pts/${pts}`;
          try {
            const st = fs.statSync(fullPath);
            if ((now - st.mtimeMs) / 1000 < 90) {
              activePtsList.add(fullPath);
            }
          } catch (e) {}
        }
      }
    } catch (e) {}

    for (const line of psLines) {
      const m = line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);
      if (!m) continue;
      const pid = parseInt(m[1], 10);
      const cmd = m[3];
      const cmdLower = cmd.toLowerCase();

      // Skip non-IDE commands or own process
      if (cmdLower.includes('grep') || cmdLower.includes('node -e') || cmdLower.includes('server/index.js')) continue;

      for (const ideDef of IDE_DEFINITIONS) {
        const matchesAlias = ideDef.aliases.some(alias => 
          cmdLower.includes(alias) || 
          cmdLower.includes(`/${alias}`) ||
          cmdLower.includes(`bin/${alias}`)
        );

        if (matchesAlias) {
          if (!detectedIDEs.has(ideDef.name)) {
            detectedIDEs.set(ideDef.name, {
              key: ideDef.key,
              name: ideDef.name,
              configDirs: ideDef.configDirs || [],
              pids: [],
              workspaces: new Set(),
              recentFiles: [],
              hasActiveTerminal: false,
              lastActiveSecs: Infinity,
              activityScore: 0
            });
          }

          const entry = detectedIDEs.get(ideDef.name);
          entry.pids.push(pid);

          // Check child working directory
          try {
            const cwd = fs.readlinkSync(`/proc/${pid}/cwd`);
            if (cwd && cwd !== '/' && cwd !== os.homedir() && !cwd.startsWith('/proc') && !cwd.startsWith('/tmp')) {
              entry.workspaces.add(cwd);
            }
          } catch (e) {}

          // Check if this process has an active pts
          if (activePtsList.size > 0) {
            try {
              const fdDir = `/proc/${pid}/fd`;
              if (fs.existsSync(fdDir)) {
                const fds = fs.readdirSync(fdDir);
                for (const fd of fds) {
                  try {
                    const target = fs.readlinkSync(path.join(fdDir, fd));
                    if (activePtsList.has(target)) {
                      entry.hasActiveTerminal = true;
                      entry.activityScore += 50;
                      break;
                    }
                  } catch (e) {}
                }
              }
            } catch (e) {}
          }
          break;
        }
      }
    }

    // 2. Read workspaceStorage & History for Electron/VSCode-based IDEs
    for (const [name, ide] of detectedIDEs.entries()) {
      for (const configDir of ide.configDirs) {
        if (!configDir || !fs.existsSync(configDir)) continue;

        // Check workspaceStorage
        const wsDir = path.join(configDir, 'User', 'workspaceStorage');
        if (fs.existsSync(wsDir)) {
          try {
            const hashes = fs.readdirSync(wsDir);
            const wsEntries = [];
            for (const h of hashes) {
              const hPath = path.join(wsDir, h);
              try {
                const stat = fs.statSync(hPath);
                const wsJson = path.join(hPath, 'workspace.json');
                let folder = null;
                if (fs.existsSync(wsJson)) {
                  const d = JSON.parse(fs.readFileSync(wsJson, 'utf-8'));
                  folder = d.folder || d.workspace;
                  if (folder && folder.startsWith('file://')) {
                    folder = decodeURIComponent(folder.replace('file://', ''));
                  }
                }
                wsEntries.push({ folder, mtime: stat.mtimeMs });
              } catch (e) {}
            }
            wsEntries.sort((a, b) => b.mtime - a.mtime);
            if (wsEntries.length > 0) {
              const recent = wsEntries[0];
              if (recent.folder && !recent.folder.includes('.code-workspace')) {
                ide.workspaces.add(recent.folder);
              }
              const ageSecs = Math.max(0, Math.round((now - recent.mtime) / 1000));
              ide.lastActiveSecs = Math.min(ide.lastActiveSecs, ageSecs);
              if (ageSecs < 120) {
                ide.activityScore += 40;
              } else if (ageSecs < 600) {
                ide.activityScore += 20;
              }
            }
          } catch (e) {}
        }

        // Check User/History for recent file edits
        const histDir = path.join(configDir, 'User', 'History');
        if (fs.existsSync(histDir)) {
          try {
            const hDirs = fs.readdirSync(histDir);
            const fileEntries = [];
            for (const hd of hDirs) {
              const entriesJson = path.join(histDir, hd, 'entries.json');
              if (fs.existsSync(entriesJson)) {
                try {
                  const edata = JSON.parse(fs.readFileSync(entriesJson, 'utf-8'));
                  let res = edata.resource;
                  if (res && res.startsWith('file://')) {
                    res = decodeURIComponent(res.replace('file://', ''));
                  }
                  const tsList = (edata.entries || []).map(e => e.timestamp || 0);
                  const maxTs = tsList.length > 0 ? Math.max(...tsList) : fs.statSync(entriesJson).mtimeMs;
                  fileEntries.push({ file: res, ts: maxTs });
                } catch (e) {}
              }
            }
            fileEntries.sort((a, b) => b.ts - a.ts);
            if (fileEntries.length > 0) {
              ide.recentFiles = fileEntries.slice(0, 3).map(f => f.file).filter(Boolean);
              const latestEditAge = Math.max(0, Math.round((now - fileEntries[0].ts) / 1000));
              if (latestEditAge < 180) {
                ide.activityScore += 50;
              } else if (latestEditAge < 900) {
                ide.activityScore += 25;
              }
            }
          } catch (e) {}
        }
      }
    }

    // Process list into formatted active IDEs array
    const idesList = [];
    for (const [name, ide] of detectedIDEs.entries()) {
      const wsArray = Array.from(ide.workspaces).filter(w => w && w !== '/' && w !== os.homedir());
      const primaryWs = wsArray[0] || null;
      const cleanWs = cleanProjectName(primaryWs);
      const branch = primaryWs ? getGitBranch(primaryWs) : null;
      const latestFile = ide.recentFiles.length > 0 ? path.basename(ide.recentFiles[0]) : null;

      // Base score for process count
      ide.activityScore += Math.min(20, ide.pids.length);

      idesList.push({
        key: ide.key,
        name: ide.name,
        processCount: ide.pids.length,
        workspaces: wsArray.map(cleanProjectName).filter(Boolean),
        rawWorkspaces: wsArray,
        currentWorkspace: cleanWs,
        currentWorkspacePath: primaryWs,
        gitBranch: branch,
        currentFile: latestFile,
        recentFiles: ide.recentFiles.map(f => path.basename(f)),
        hasActiveTerminal: ide.hasActiveTerminal,
        lastActiveSecs: ide.lastActiveSecs === Infinity ? null : ide.lastActiveSecs,
        activityScore: ide.activityScore,
        isActive: false
      });
    }

    // Sort by activityScore descending
    idesList.sort((a, b) => b.activityScore - a.activityScore);

    let primary = null;
    if (idesList.length > 0) {
      idesList[0].isActive = true;
      primary = idesList[0];
    }

    return {
      activeIDEs: idesList,
      primaryActiveIDE: primary
    };
  }

  async _detectLinux() {
    let idleSeconds = 0;
    let activeWindow = null;
    let media = null;

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

    const isIdle = idleSeconds > this.idleThresholdSecs;

    // 2. Media via MPRIS D-Bus
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
            const playerFormatted = this._formatAppName(rawPlayer);
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

    // 3. Inspect running IDEs on the host
    const { activeIDEs, primaryActiveIDE } = await this._inspectRunningIDEs();

    // 4. Active Window Detection (Wayland / X11)
    // Check Hyprland
    try {
      const { stdout: hyprOut } = await execAsync('hyprctl activewindow -j');
      const parsed = JSON.parse(hyprOut.trim());
      if (parsed && (parsed.class || parsed.title)) {
        activeWindow = {
          title: parsed.title || parsed.class,
          wmClass: parsed.class || '',
          pid: parsed.pid || null
        };
      }
    } catch (e) {}

    // Check Sway
    if (!activeWindow) {
      try {
        const { stdout: swayOut } = await execAsync('swaymsg -t get_tree');
        const root = JSON.parse(swayOut);
        const findFocused = (node) => {
          if (node.focused) return node;
          for (const ch of node.nodes || []) {
            const f = findFocused(ch);
            if (f) return f;
          }
          for (const ch of node.floating_nodes || []) {
            const f = findFocused(ch);
            if (f) return f;
          }
          return null;
        };
        const focused = findFocused(root);
        if (focused && (focused.name || focused.app_id)) {
          activeWindow = {
            title: focused.name || focused.app_id,
            wmClass: focused.app_id || '',
            pid: focused.pid || null
          };
        }
      } catch (e) {}
    }

    // Check X11 / Xwayland via xprop
    if (!activeWindow) {
      try {
        let winId = null;
        try {
          const { stdout: rootOut } = await execAsync('xprop -root _NET_ACTIVE_WINDOW');
          const winMatch = rootOut.match(/window id # (0x[0-9a-fA-F]+)/);
          if (winMatch && winMatch[1] !== '0x0' && winMatch[1] !== '0x400003') {
            winId = winMatch[1];
          }
        } catch (e) {}

        if (!winId) {
          try {
            const { stdout: stackOut } = await execAsync('xprop -root _NET_CLIENT_LIST_STACKING');
            const stackMatch = stackOut.match(/window id # ([0-9a-fA-Fx,\s]+)/);
            if (stackMatch) {
              const ids = stackMatch[1].split(',').map(s => s.trim()).filter(Boolean);
              if (ids.length > 0) {
                for (let i = ids.length - 1; i >= 0; i--) {
                  const testId = ids[i];
                  try {
                    const { stdout: testProps } = await execAsync(`xprop -id ${testId} _NET_WM_NAME WM_NAME WM_CLASS`);
                    const tMatch = testProps.match(/(?:_NET_WM_NAME|WM_NAME)\([^)]+\)\s*=\s*"([^"]+)"/);
                    const title = tMatch ? tMatch[1] : '';
                    if (title && !['hidamari', 'Wayland to X Recording bridge', 'gnome-shell', 'xwaylandvideobridge'].includes(title)) {
                      winId = testId;
                      break;
                    }
                  } catch (e) {}
                }
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
            
            if (rawTitle && !['hidamari', 'Wayland to X Recording bridge', 'gnome-shell', 'xwaylandvideobridge'].includes(rawTitle)) {
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
    }

    // 5. Synthesize result
    let appName = null;
    let windowTitle = null;
    let category = 'other';
    let notes = '';
    let workspace = null;
    let gitBranch = null;
    let file = null;
    let ideName = null;

    if (activeWindow && (activeWindow.title || activeWindow.wmClass)) {
      appName = this._formatAppName(activeWindow.wmClass || activeWindow.title);
      windowTitle = activeWindow.title || appName;
      category = detectCategory(appName, windowTitle);

      // If active window is an IDE, enrich with workspace details
      const matchedIDE = activeIDEs.find(ide => 
        ide.name.toLowerCase() === appName.toLowerCase() ||
        appName.toLowerCase().includes(ide.key)
      );

      if (matchedIDE) {
        category = 'coding';
        ideName = matchedIDE.name;
        workspace = matchedIDE.currentWorkspace;
        gitBranch = matchedIDE.gitBranch;
        file = matchedIDE.currentFile;
        for (const ide of activeIDEs) ide.isActive = (ide.name === matchedIDE.name);
      }
    } else if (primaryActiveIDE && !isIdle) {
      // Actively coding in primary IDE on Wayland host
      appName = primaryActiveIDE.name;
      ideName = primaryActiveIDE.name;
      category = 'coding';
      workspace = primaryActiveIDE.currentWorkspace;
      gitBranch = primaryActiveIDE.gitBranch;
      file = primaryActiveIDE.currentFile;

      if (workspace && file) {
        windowTitle = `${workspace} — ${file}${gitBranch ? ` (${gitBranch})` : ''}`;
      } else if (workspace) {
        windowTitle = `${workspace} (Active Workspace)${gitBranch ? ` [${gitBranch}]` : ''}`;
      } else {
        windowTitle = `${primaryActiveIDE.name} Workspace`;
      }
      notes = `Active IDE session in ${primaryActiveIDE.name}${workspace ? ` (${workspace})` : ''}`;
    } else if (media && media.isPlaying) {
      appName = media.player || 'Music Player';
      windowTitle = `${media.artist ? media.artist + ' - ' : ''}${media.title}`;
      category = 'music';
      notes = `Playing on ${media.player}${media.album ? ` (${media.album})` : ''}`;
    }

    if (media && media.isPlaying && appName && category !== 'music') {
      notes = `Background Music: ${media.artist ? media.artist + ' - ' : ''}${media.title}`;
    }

    return {
      appName,
      windowTitle,
      category,
      workspace,
      gitBranch,
      file,
      ideName,
      activeIDEs,
      primaryActiveIDE,
      idleSeconds,
      isIdle,
      media,
      notes
    };
  }

  async _detectWindows() {
    let idleSeconds = 0;
    let appName = null;
    let windowTitle = null;
    let category = 'other';
    let workspace = null;
    let gitBranch = null;
    let file = null;
    let ideName = null;
    const { activeIDEs, primaryActiveIDE } = await this._inspectRunningIDEs();

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
        if ($hwnd -ne [IntPtr]::Zero) {
          $sb = New-Object System.Text.StringBuilder 256
          [WinUtil]::GetWindowText($hwnd, $sb, 256) | Out-Null
          $title = $sb.ToString()
          $pid = 0
          [WinUtil]::GetWindowThreadProcessId($hwnd, [ref]$pid) | Out-Null
          $proc = if ($pid -gt 0) { (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName } else { "" }
          $idle = [WinUtil]::GetIdle()
          @{ App = $proc; Title = $title; Idle = $idle } | ConvertTo-Json -Compress
        } else {
          $idle = [WinUtil]::GetIdle()
          @{ App = ""; Title = ""; Idle = $idle } | ConvertTo-Json -Compress
        }
      `;

      const { stdout } = await execAsync(`powershell -NoProfile -NonInteractive -Command "${psScript.replace(/\n/g, ' ')}"`);
      const parsed = JSON.parse(stdout.trim());
      if (parsed && (parsed.App || parsed.Title)) {
        appName = this._formatAppName(parsed.App || parsed.Title);
        windowTitle = parsed.Title || appName;
        idleSeconds = parseInt(parsed.Idle, 10) || 0;
        category = detectCategory(appName, windowTitle);

        if (category === 'coding') {
          ideName = appName;
          const matchedIDE = activeIDEs.find(i => i.name.toLowerCase() === appName.toLowerCase() || appName.toLowerCase().includes(i.key));
          if (matchedIDE) {
            workspace = matchedIDE.currentWorkspace;
            gitBranch = matchedIDE.gitBranch;
            file = matchedIDE.currentFile;
            for (const ide of activeIDEs) ide.isActive = (ide.name === matchedIDE.name);
          }
        }
      } else if (parsed) {
        idleSeconds = parseInt(parsed.Idle, 10) || 0;
      }
    } catch (e) {}

    const isIdle = idleSeconds > this.idleThresholdSecs;

    if (!appName && primaryActiveIDE && !isIdle) {
      appName = primaryActiveIDE.name;
      ideName = primaryActiveIDE.name;
      category = 'coding';
      workspace = primaryActiveIDE.currentWorkspace;
      gitBranch = primaryActiveIDE.gitBranch;
      file = primaryActiveIDE.currentFile;
      windowTitle = workspace ? `${workspace} (Active Workspace)` : `${primaryActiveIDE.name} Workspace`;
    }

    return {
      appName,
      windowTitle,
      category,
      workspace,
      gitBranch,
      file,
      ideName,
      activeIDEs,
      primaryActiveIDE,
      idleSeconds,
      isIdle,
      media: null,
      notes: ''
    };
  }

  async _detectMacOS() {
    let appName = null;
    let windowTitle = null;
    let category = 'other';
    let idleSeconds = 0;
    let workspace = null;
    let gitBranch = null;
    let file = null;
    let ideName = null;
    const { activeIDEs, primaryActiveIDE } = await this._inspectRunningIDEs();

    try {
      const { stdout } = await execAsync(`osascript -e 'tell application "System Events" to get {name, title} of first application process whose frontmost is true'`);
      const parts = stdout.trim().split(', ');
      if (parts.length > 0 && parts[0]) {
        appName = this._formatAppName(parts[0]);
        windowTitle = parts[1] || appName;
        category = detectCategory(appName, windowTitle);

        if (category === 'coding') {
          ideName = appName;
          const matchedIDE = activeIDEs.find(i => i.name.toLowerCase() === appName.toLowerCase() || appName.toLowerCase().includes(i.key));
          if (matchedIDE) {
            workspace = matchedIDE.currentWorkspace;
            gitBranch = matchedIDE.gitBranch;
            file = matchedIDE.currentFile;
            for (const ide of activeIDEs) ide.isActive = (ide.name === matchedIDE.name);
          }
        }
      }
    } catch (e) {}

    try {
      const { stdout: idleOut } = await execAsync(`ioreg -c IOHIDSystem | awk '/HIDIdleTime/ {print int($NF/1000000000); exit}'`);
      idleSeconds = parseInt(idleOut.trim(), 10) || 0;
    } catch (e) {}

    const isIdle = idleSeconds > this.idleThresholdSecs;

    if (!appName && primaryActiveIDE && !isIdle) {
      appName = primaryActiveIDE.name;
      ideName = primaryActiveIDE.name;
      category = 'coding';
      workspace = primaryActiveIDE.currentWorkspace;
      gitBranch = primaryActiveIDE.gitBranch;
      file = primaryActiveIDE.currentFile;
      windowTitle = workspace ? `${workspace} (Active Workspace)` : `${primaryActiveIDE.name} Workspace`;
    }

    return {
      appName,
      windowTitle,
      category,
      workspace,
      gitBranch,
      file,
      ideName,
      activeIDEs,
      primaryActiveIDE,
      idleSeconds,
      isIdle,
      media: null,
      notes: ''
    };
  }

  async _detectGeneric() {
    return {
      appName: null,
      windowTitle: null,
      category: null,
      workspace: null,
      gitBranch: null,
      file: null,
      ideName: null,
      activeIDEs: [],
      primaryActiveIDE: null,
      idleSeconds: 0,
      isIdle: false,
      media: null,
      notes: ''
    };
  }

  _formatAppName(rawName) {
    if (!rawName) return '';

    // 1. Check if desktop app exists in index
    const resolved = iconResolver.resolveDesktopApp(rawName);
    if (resolved && resolved.name) {
      return resolved.name;
    }

    const lower = rawName.toLowerCase();
    if (lower.includes('antigravity')) return 'Antigravity';
    if (lower.includes('vscode') || lower.includes('visual studio code') || lower === 'code' || lower.includes('code - oss')) return 'Visual Studio Code';
    if (lower.includes('cursor')) return 'Cursor';
    if (lower.includes('windsurf')) return 'Windsurf';
    if (lower.includes('positron')) return 'Positron';
    if (lower.includes('zed')) return 'Zed';
    if (lower.includes('pycharm')) return 'PyCharm';
    if (lower.includes('intellij') || lower.includes('idea')) return 'IntelliJ IDEA';
    if (lower.includes('webstorm')) return 'WebStorm';
    if (lower.includes('clion')) return 'CLion';
    if (lower.includes('rider')) return 'JetBrains Rider';
    if (lower.includes('goland')) return 'GoLand';
    if (lower.includes('android studio') || lower.includes('studio64')) return 'Android Studio';
    if (lower.includes('sublime')) return 'Sublime Text';
    if (lower.includes('neovim') || lower.includes('nvim')) return 'Neovim';
    if (lower.includes('vim')) return 'Vim';
    if (lower.includes('emacs')) return 'Emacs';

    if (lower.includes('brave')) return 'Brave';
    if (lower.includes('chrome') || lower.includes('chromium')) return 'Google Chrome';
    if (lower.includes('firefox')) return 'Firefox';
    if (lower.includes('spotify')) return 'Spotify';
    if (lower.includes('claude')) return 'Claude';
    if (lower.includes('slack')) return 'Slack';
    if (lower.includes('discord')) return 'Discord';
    if (lower.includes('notion')) return 'Notion';
    if (lower.includes('steam')) return 'Steam';
    if (lower.includes('onlyoffice')) return 'ONLYOFFICE';
    if (lower.includes('terminal') || lower.includes('ptyxis') || lower.includes('alacritty') || lower.includes('kitty') || lower.includes('bash')) return 'Terminal';
    
    if (rawName.includes('.')) {
      const parts = rawName.split('.');
      const lastPart = parts[parts.length - 1];
      if (lastPart.length > 1) {
        return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
      }
    }
    return rawName.charAt(0).toUpperCase() + rawName.slice(1);
  }

  async processProbeResult(probe) {
    this.lastIdleSeconds = probe.idleSeconds || 0;
    this.isIdle = probe.isIdle;
    this.currentMedia = probe.media || null;
    this.activeIDEs = probe.activeIDEs || [];
    this.primaryActiveIDE = probe.primaryActiveIDE || null;

    const now = new Date();

    // If user is idle and no active media is playing, finalize current activity
    if (probe.isIdle && (!probe.media || !probe.media.isPlaying)) {
      if (this.currentActivity) {
        await this._finalizeCurrentActivity();
      }
      return;
    }

    // If no active app and no active media, finalize current activity
    if (!probe.appName && (!probe.media || !probe.media.isPlaying)) {
      if (this.currentActivity) {
        await this._finalizeCurrentActivity();
      }
      return;
    }

    let appName = probe.appName;
    let windowTitle = probe.windowTitle;
    let category = probe.category;
    let notes = probe.notes || '';
    let workspace = probe.workspace || null;
    let gitBranch = probe.gitBranch || null;
    let file = probe.file || null;
    let ideName = probe.ideName || null;

    if (!appName && probe.media && probe.media.isPlaying) {
      appName = probe.media.player || 'Music Player';
      windowTitle = `${probe.media.artist ? probe.media.artist + ' - ' : ''}${probe.media.title}`;
      category = 'music';
      notes = `Playing on ${probe.media.player}${probe.media.album ? ` (${probe.media.album})` : ''}`;
    }

    if (!appName) {
      if (this.currentActivity) {
        await this._finalizeCurrentActivity();
      }
      return;
    }

    // Check if continuing same activity session (same app & category & workspace)
    const isSameActivity = this.currentActivity && 
      this.currentActivity.appName === appName && 
      this.currentActivity.category === category &&
      (this.currentActivity.workspace === workspace || (!this.currentActivity.workspace && !workspace));

    if (isSameActivity) {
      // Accumulate time in current session
      const startTime = new Date(this.currentActivity.startTime);
      const currentDurationSecs = Math.max(1, Math.round((now.getTime() - startTime.getTime()) / 1000));

      this.currentActivity.duration = currentDurationSecs;
      this.currentActivity.lastActiveTime = now.toISOString();
      this.currentActivity.title = windowTitle || this.currentActivity.title;
      this.currentActivity.notes = notes || this.currentActivity.notes;
      this.currentActivity.workspace = workspace || this.currentActivity.workspace;
      this.currentActivity.gitBranch = gitBranch || this.currentActivity.gitBranch;
      this.currentActivity.file = file || this.currentActivity.file;
      this.currentActivity.ideName = ideName || this.currentActivity.ideName;

      // Update in db periodically (every ~3 seconds / 2 polls)
      if (this.totalPolledCount % 2 === 0) {
        await db.update(this.currentActivity.id, {
          duration: currentDurationSecs,
          endTime: now.toISOString(),
          title: this.currentActivity.title,
          notes: this.currentActivity.notes,
          workspace: this.currentActivity.workspace,
          gitBranch: this.currentActivity.gitBranch,
          file: this.currentActivity.file,
          ideName: this.currentActivity.ideName
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
        notes,
        workspace,
        gitBranch,
        file,
        ideName
      });

      this.currentActivity = {
        id: newEntry.id,
        appName: newEntry.appName,
        title: newEntry.title,
        category: newEntry.category,
        workspace: newEntry.workspace,
        gitBranch: newEntry.gitBranch,
        file: newEntry.file,
        ideName: newEntry.ideName,
        startTime: newEntry.startTime,
        lastActiveTime: now.toISOString(),
        duration: newEntry.duration,
        notes: newEntry.notes,
        iconUrl: `/api/icons/${encodeURIComponent(newEntry.appName)}`
      };

      console.log(`[MachineTracker] Started tracking: [${category.toUpperCase()}] ${appName} ${workspace ? `[📁 ${workspace}]` : ''} - "${windowTitle}"`);
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
      sessionType: this.sessionType,
      desktopEnvironment: this.desktopEnvironment,
      pollIntervalMs: this.pollIntervalMs,
      idleThresholdSecs: this.idleThresholdSecs,
      idleSeconds: this.lastIdleSeconds,
      isIdle: this.isIdle,
      currentActivity: this.currentActivity ? {
        ...this.currentActivity,
        iconUrl: `/api/icons/${encodeURIComponent(this.currentActivity.appName)}`,
        liveDuration: this.currentActivity.startTime
          ? Math.max(1, Math.round((Date.now() - new Date(this.currentActivity.startTime).getTime()) / 1000))
          : this.currentActivity.duration
      } : null,
      activeIDEs: this.activeIDEs,
      primaryActiveIDE: this.primaryActiveIDE,
      media: this.currentMedia,
      lastPollTime: this.lastPollTime,
      totalPolledCount: this.totalPolledCount
    };
  }
}

export const machineTracker = new MachineTracker();
