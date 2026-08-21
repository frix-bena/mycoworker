import fs from 'fs';
import path from 'path';
import os from 'os';

// Standard desktop application entry directories on Linux
const DESKTOP_DIRS = [
  '/usr/share/applications',
  '/usr/local/share/applications',
  path.join(os.homedir(), '.local/share/applications'),
  '/var/lib/flatpak/exports/share/applications',
  path.join(os.homedir(), '.local/share/flatpak/exports/share/applications'),
  '/var/lib/snapd/desktop/applications',
  path.join(os.homedir(), '.local/share/snap/desktop/applications')
];

// Standard icon theme directories on Linux
const ICON_DIRS = [
  '/usr/share/pixmaps',
  '/usr/share/icons',
  '/var/lib/flatpak/exports/share/icons',
  path.join(os.homedir(), '.local/share/flatpak/exports/share/icons'),
  path.join(os.homedir(), '.local/share/icons'),
  path.join(os.homedir(), '.icons'),
  '/usr/local/share/icons',
  '/var/lib/snapd/desktop/icons'
];

export const MIME_TYPES = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

function normalize(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Score icon file candidate based on quality, format, and size
 */
function scoreIcon(filePath, matchType) {
  const ext = path.extname(filePath).toLowerCase();
  let score = 0;

  if (matchType === 'exact') score += 5000;
  else if (matchType === 'cleanExact') score += 3000;
  else if (matchType === 'prefix') score += 1000;
  else score += 100;

  // Prefer scalable vector SVG
  if (ext === '.svg') score += 600;
  // High resolution raster images
  if (filePath.includes('512x512')) score += 450;
  if (filePath.includes('256x256')) score += 400;
  if (filePath.includes('128x128')) score += 300;
  if (filePath.includes('64x64')) score += 200;
  if (filePath.includes('48x48')) score += 150;
  if (filePath.includes('32x32')) score += 100;
  if (filePath.includes('pixmaps')) score += 250;
  if (filePath.includes('/apps/')) score += 200;
  if (filePath.includes('hicolor')) score += 100;

  // Heavily penalize monochromatic symbolic icons over colored brand icons
  if (filePath.includes('-symbolic') || filePath.includes('/symbolic/')) {
    score -= 600;
  }

  // Heavily penalize non-app folders for fuzzy/prefix matches
  if (
    filePath.includes('/mimetypes/') ||
    filePath.includes('/actions/') ||
    filePath.includes('/status/') ||
    filePath.includes('/places/') ||
    filePath.includes('/emblems/') ||
    filePath.includes('/categories/') ||
    filePath.includes('/devices/')
  ) {
    score -= 2500;
  }

  return score;
}

class IconResolver {
  constructor() {
    this.desktopApps = []; // Array of parsed .desktop objects
    this.wmClassIndex = new Map(); // wm_class -> desktop app
    this.nameIndex = new Map(); // app name / clean name -> desktop app
    this.execIndex = new Map(); // exec binary -> desktop app
    this.iconCache = new Map(); // iconName or appName -> absolute file path or null
    this.base64Cache = new Map(); // appName -> dataUrl
    this.indexedIconsList = []; // List of all system icon paths for fast search
    this.lastIndexedAt = null;

    this.init();
  }

  init() {
    try {
      this._indexDesktopFiles();
      this._indexSystemIcons();
      this.lastIndexedAt = new Date().toISOString();
      console.log(`[IconResolver] Indexed ${this.desktopApps.length} desktop applications and ${this.indexedIconsList.length} system icons`);
    } catch (e) {
      console.error('[IconResolver] Error initializing icon resolver:', e.message);
    }
  }

  _parseDesktopFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const nameMatch = content.match(/^Name\s*=\s*(.+)$/m);
      const execMatch = content.match(/^Exec\s*=\s*(.+)$/m);
      const iconMatch = content.match(/^Icon\s*=\s*(.+)$/m);
      const wmClassMatch = content.match(/^StartupWMClass\s*=\s*(.+)$/m);
      const genericMatch = content.match(/^GenericName\s*=\s*(.+)$/m);
      const catMatch = content.match(/^Categories\s*=\s*(.+)$/m);
      const nodisplayMatch = content.match(/^NoDisplay\s*=\s*(true|1)$/mi);

      if (!nameMatch || !nameMatch[1]) return null;

      let execBin = null;
      if (execMatch && execMatch[1]) {
        const execStr = execMatch[1].trim();
        const parts = execStr.split(/\s+/);
        execBin = path.basename(parts[0] || '').replace(/['"]/g, '');
        if (execBin === 'flatpak' && parts.includes('run')) {
          const cmdIndex = parts.indexOf('--command');
          if (cmdIndex !== -1 && parts[cmdIndex + 1]) {
            execBin = path.basename(parts[cmdIndex + 1]);
          }
        }
      }

      return {
        file: path.basename(filePath),
        filePath,
        name: nameMatch[1].trim(),
        exec: execMatch ? execMatch[1].trim() : null,
        execBin,
        icon: iconMatch ? iconMatch[1].trim() : null,
        wmClass: wmClassMatch ? wmClassMatch[1].trim() : null,
        genericName: genericMatch ? genericMatch[1].trim() : null,
        categories: catMatch ? catMatch[1].trim() : null,
        noDisplay: !!nodisplayMatch
      };
    } catch (e) {
      return null;
    }
  }

  _indexDesktopFiles() {
    this.desktopApps = [];
    this.wmClassIndex.clear();
    this.nameIndex.clear();
    this.execIndex.clear();

    for (const dir of DESKTOP_DIRS) {
      if (!fs.existsSync(dir)) continue;
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (!file.endsWith('.desktop')) continue;
          const fullPath = path.join(dir, file);
          const app = this._parseDesktopFile(fullPath);
          if (app) {
            this.desktopApps.push(app);

            // Index by file basename (e.g. "code.desktop", "com.brave.Browser.desktop")
            const fileBase = path.basename(file, '.desktop');
            this.nameIndex.set(normalize(fileBase), app);

            // Index by Name
            this.nameIndex.set(normalize(app.name), app);

            // Index by WMClass
            if (app.wmClass) {
              this.wmClassIndex.set(normalize(app.wmClass), app);
              this.wmClassIndex.set(app.wmClass.toLowerCase(), app);
            }

            // Index by Exec binary
            if (app.execBin) {
              this.execIndex.set(normalize(app.execBin), app);
            }
          }
        }
      } catch (e) {}
    }
  }

  _indexSystemIcons() {
    this.indexedIconsList = [];
    for (const rootDir of ICON_DIRS) {
      if (!fs.existsSync(rootDir)) continue;
      this._walkIcons(rootDir, 0);
    }
  }

  _walkIcons(dir, depth = 0) {
    if (depth > 6) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          this._walkIcons(full, depth + 1);
        } else if (ent.isFile() || ent.isSymbolicLink()) {
          const ext = path.extname(ent.name).toLowerCase();
          if (['.png', '.svg', '.ico', '.webp'].includes(ext)) {
            this.indexedIconsList.push(full);
          }
        }
      }
    } catch (e) {}
  }

  /**
   * Resolves a desktop application entry from a window class, title, or process name
   */
  resolveDesktopApp(identifier = '') {
    if (!identifier) return null;
    const norm = normalize(identifier);
    const lower = identifier.toLowerCase().trim();

    // 1. Direct WM_CLASS match
    if (this.wmClassIndex.has(norm)) return this.wmClassIndex.get(norm);
    if (this.wmClassIndex.has(lower)) return this.wmClassIndex.get(lower);

    // 2. Direct Name match
    if (this.nameIndex.has(norm)) return this.nameIndex.get(norm);

    // 3. Exec binary match
    if (this.execIndex.has(norm)) return this.execIndex.get(norm);

    // 4. Substring / fuzzy match
    for (const app of this.desktopApps) {
      const appNorm = normalize(app.name);
      const wmNorm = app.wmClass ? normalize(app.wmClass) : '';
      const fileNorm = normalize(app.file);

      if (
        (norm.length >= 3 && (appNorm.includes(norm) || norm.includes(appNorm))) ||
        (wmNorm && (wmNorm.includes(norm) || norm.includes(wmNorm))) ||
        (fileNorm && fileNorm.includes(norm))
      ) {
        return app;
      }
    }

    return null;
  }

  /**
   * Resolves an icon name / path to the best absolute system file path
   */
  resolveIconPath(iconNameOrAppName = '') {
    if (!iconNameOrAppName) return null;
    const cacheKey = normalize(iconNameOrAppName);
    if (this.iconCache.has(cacheKey)) {
      return this.iconCache.get(cacheKey);
    }

    // If already absolute path and exists
    if (path.isAbsolute(iconNameOrAppName) && fs.existsSync(iconNameOrAppName)) {
      this.iconCache.set(cacheKey, iconNameOrAppName);
      return iconNameOrAppName;
    }

    // 1. Check if identifier maps to a desktop app with an Icon field
    const desktopApp = this.resolveDesktopApp(iconNameOrAppName);
    const candidatesToSearch = [iconNameOrAppName];

    if (desktopApp) {
      if (desktopApp.icon) {
        if (path.isAbsolute(desktopApp.icon) && fs.existsSync(desktopApp.icon)) {
          this.iconCache.set(cacheKey, desktopApp.icon);
          return desktopApp.icon;
        }
        candidatesToSearch.unshift(desktopApp.icon);
      }
      if (desktopApp.wmClass) candidatesToSearch.push(desktopApp.wmClass);
      if (desktopApp.name) candidatesToSearch.push(desktopApp.name);
    }

    // 2. Common aliases
    const lower = iconNameOrAppName.toLowerCase();
    if (lower.includes('code') || lower.includes('vscode')) candidatesToSearch.push('vscode', 'code', 'visual-studio-code');
    if (lower.includes('antigravity')) candidatesToSearch.push('antigravity');
    if (lower.includes('claude')) candidatesToSearch.push('claude-desktop-unofficial', 'claude', 'com.anthropic.claude');
    if (lower.includes('brave')) candidatesToSearch.push('com.brave.Browser', 'brave-browser', 'brave');
    if (lower.includes('chrome')) candidatesToSearch.push('google-chrome', 'google-chrome-stable', 'chromium');
    if (lower.includes('firefox')) candidatesToSearch.push('firefox', 'firefox-esr');
    if (lower.includes('steam')) candidatesToSearch.push('steam', 'com.valvesoftware.Steam');
    if (lower.includes('terminal')) candidatesToSearch.push('org.gnome.Terminal', 'ptyxis', 'utilities-terminal', 'terminal');
    if (lower.includes('spotify')) candidatesToSearch.push('spotify-client', 'spotify');
    if (lower.includes('onlyoffice')) candidatesToSearch.push('org.onlyoffice.desktopeditors');

    // 3. Search in indexed system icons
    const GENERIC_EXCLUDES = new Set(['unknown', 'generic', 'default', 'folder', 'file', 'application', 'action', 'status', 'document', 'text', 'dialog']);
    const matched = [];
    for (const searchTarget of candidatesToSearch) {
      const rawTarget = searchTarget.toLowerCase().replace(/\.(png|svg|ico|xpm)$/, '');
      const cleanTarget = normalize(rawTarget);
      if (!cleanTarget) continue;

      for (const iconFile of this.indexedIconsList) {
        const ext = path.extname(iconFile).toLowerCase();
        const base = path.basename(iconFile, ext).toLowerCase();
        const cleanBase = normalize(base);

        if (base === rawTarget) {
          matched.push({ path: iconFile, score: scoreIcon(iconFile, 'exact') });
        } else if (cleanBase === cleanTarget) {
          matched.push({ path: iconFile, score: scoreIcon(iconFile, 'cleanExact') });
        } else if (
          (base.startsWith(rawTarget) || rawTarget.startsWith(base)) &&
          Math.min(base.length, rawTarget.length) >= 3 &&
          !GENERIC_EXCLUDES.has(base) &&
          !GENERIC_EXCLUDES.has(rawTarget) &&
          (iconFile.includes('/apps/') || iconFile.includes('pixmaps') || iconFile.includes('applications'))
        ) {
          matched.push({ path: iconFile, score: scoreIcon(iconFile, 'prefix') });
        }
      }

      if (matched.length > 0) break;
    }

    if (matched.length > 0) {
      matched.sort((a, b) => b.score - a.score);
      const best = matched[0].path;
      this.iconCache.set(cacheKey, best);
      return best;
    }

    // Not found
    this.iconCache.set(cacheKey, null);
    return null;
  }

  /**
   * Reads icon file and returns as base64 data URL
   */
  getIconBase64(appName = '') {
    const cacheKey = normalize(appName);
    if (this.base64Cache.has(cacheKey)) {
      return this.base64Cache.get(cacheKey);
    }

    const iconPath = this.resolveIconPath(appName);
    if (!iconPath || !fs.existsSync(iconPath)) {
      this.base64Cache.set(cacheKey, null);
      return null;
    }

    try {
      const ext = path.extname(iconPath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'image/png';
      const fileData = fs.readFileSync(iconPath);
      const base64 = fileData.toString('base64');
      const dataUrl = `data:${mime};base64,${base64}`;
      this.base64Cache.set(cacheKey, dataUrl);
      return dataUrl;
    } catch (e) {
      return null;
    }
  }

  /**
   * Generates a sleek generic SVG icon for fallback
   */
  getGenericFallbackSvg(appName = 'App') {
    const initial = (appName || 'A').trim().charAt(0).toUpperCase();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e293b"/>
          <stop offset="1" stopColor="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="56" fill="url(#bg)" stroke="#334155" stroke-width="8"/>
      <text x="128" y="162" text-anchor="middle" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="110">${initial}</text>
    </svg>`;
  }
}

export const iconResolver = new IconResolver();
