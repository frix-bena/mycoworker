import express from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';

const router = express.Router();

const DESKTOP_DIRS = [
  '/usr/share/applications',
  '/usr/local/share/applications',
  path.join(os.homedir(), '.local/share/applications')
];

const ICON_DIRS = [
  '/usr/share/pixmaps',
  '/usr/share/icons/hicolor/512x512/apps',
  '/usr/share/icons/hicolor/256x256/apps',
  '/usr/share/icons/hicolor/128x128/apps',
  '/usr/share/icons/hicolor/64x64/apps',
  '/usr/share/icons/hicolor/48x48/apps',
  '/usr/share/icons/hicolor/32x32/apps',
  '/usr/share/icons/hicolor/scalable/apps',
  '/usr/share/icons/breeze/apps/48',
  '/usr/share/icons/breeze-dark/apps/48',
  '/usr/share/icons/Adwaita/scalable/apps',
  '/usr/share/icons/Adwaita/48x48/apps',
  path.join(os.homedir(), '.local/share/icons')
];

// In-memory icon path cache
const iconCache = new Map();

function normalizeName(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Searches system desktop entries and icon directories for an app's icon.
 */
function resolveSystemIcon(appName) {
  if (!appName) return null;
  const key = normalizeName(appName);
  if (iconCache.has(key)) {
    return iconCache.get(key);
  }

  // 1. Direct match aliases
  const aliases = [key];
  if (key.includes('code') || key.includes('vscode')) aliases.push('vscode', 'code', 'visual-studio-code');
  if (key.includes('claude')) aliases.push('claude-desktop-unofficial', 'claude-desktop', 'claude', 'com.anthropic.claude');
  if (key.includes('antigravity')) aliases.push('antigravity');
  if (key.includes('spotify')) aliases.push('spotify-client', 'spotify');
  if (key.includes('chrome')) aliases.push('google-chrome', 'google-chrome-stable', 'chromium');
  if (key.includes('firefox')) aliases.push('firefox', 'firefox-esr');
  if (key.includes('brave')) aliases.push('brave-browser', 'brave');
  if (key.includes('terminal')) aliases.push('org.gnome.Terminal', 'ptyxis', 'alacritty', 'kitty', 'terminal');
  if (key.includes('steam')) aliases.push('steam');

  // 2. Check .desktop files for explicit Icon= declaration
  let declaredIconName = null;
  for (const deskDir of DESKTOP_DIRS) {
    if (!fs.existsSync(deskDir)) continue;
    try {
      const files = fs.readdirSync(deskDir);
      for (const file of files) {
        if (!file.endsWith('.desktop')) continue;
        const normFile = normalizeName(file);
        const matchesDesktop = aliases.some(a => normFile.includes(a));
        if (matchesDesktop) {
          try {
            const content = fs.readFileSync(path.join(deskDir, file), 'utf-8');
            const iconMatch = content.match(/^Icon\s*=\s*(.+)$/m);
            if (iconMatch && iconMatch[1]) {
              const iconVal = iconMatch[1].trim();
              if (path.isAbsolute(iconVal) && fs.existsSync(iconVal)) {
                iconCache.set(key, iconVal);
                return iconVal;
              }
              declaredIconName = iconVal;
              aliases.unshift(normalizeName(iconVal));
              break;
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
    if (declaredIconName) break;
  }

  // 3. Search in ICON_DIRS
  for (const iconDir of ICON_DIRS) {
    if (!fs.existsSync(iconDir)) continue;
    try {
      const files = fs.readdirSync(iconDir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!['.png', '.svg', '.ico', '.jpg', '.jpeg', '.webp'].includes(ext)) continue;
        const base = normalizeName(path.basename(file, ext));
        for (const alias of aliases) {
          if (base === alias || base.startsWith(alias) || alias.startsWith(base)) {
            const fullPath = path.join(iconDir, file);
            iconCache.set(key, fullPath);
            return fullPath;
          }
        }
      }
    } catch (e) {}
  }

  iconCache.set(key, null);
  return null;
}

const MIME_MAP = {
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

// GET /api/icons/:appName
router.get('/:appName', (req, res) => {
  const { appName } = req.params;
  const iconPath = resolveSystemIcon(appName);

  if (!iconPath || !fs.existsSync(iconPath)) {
    return res.status(404).json({ error: 'Icon not found on system' });
  }

  const ext = path.extname(iconPath).toLowerCase();
  const contentType = MIME_MAP[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
  
  const stream = fs.createReadStream(iconPath);
  stream.pipe(res);
});

export default router;
