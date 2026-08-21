import express from 'express';
import fs from 'fs';
import path from 'path';
import { iconResolver, MIME_TYPES } from '../iconResolver.js';

const router = express.Router();

// GET /api/icons/:appName - Stream authentic app icon or fallback SVG
router.get('/:appName', (req, res) => {
  const { appName } = req.params;
  const { fallback } = req.query;

  const iconPath = iconResolver.resolveIconPath(appName);

  if (iconPath && fs.existsSync(iconPath)) {
    const ext = path.extname(iconPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
    res.setHeader('X-Icon-Source', 'system-disk');
    res.setHeader('X-Icon-Path', iconPath);

    const stream = fs.createReadStream(iconPath);
    return stream.pipe(res);
  }

  // If explicit 404 requested without fallback
  if (fallback === 'none' || fallback === 'false' || fallback === '404') {
    return res.status(404).json({ success: false, error: `Icon for '${appName}' not found on system` });
  }

  // Fallback to generic vector SVG
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('X-Icon-Source', 'fallback-svg');
  return res.send(iconResolver.getGenericFallbackSvg(appName));
});

// GET /api/icons/:appName/base64 - Return base64 data URL
router.get('/:appName/base64', (req, res) => {
  const { appName } = req.params;
  const dataUrl = iconResolver.getIconBase64(appName);

  if (dataUrl) {
    return res.json({
      success: true,
      appName,
      dataUrl,
      isFallback: false
    });
  }

  // Fallback base64
  const svg = iconResolver.getGenericFallbackSvg(appName);
  const fallbackDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  res.json({
    success: true,
    appName,
    dataUrl: fallbackDataUrl,
    isFallback: true
  });
});

// GET /api/icons/system/apps - List indexed system applications
router.get('/system/apps', (req, res) => {
  try {
    const apps = iconResolver.desktopApps.map(a => ({
      name: a.name,
      file: a.file,
      wmClass: a.wmClass,
      iconName: a.icon,
      hasIcon: !!iconResolver.resolveIconPath(a.icon || a.name || a.wmClass)
    }));

    res.json({
      success: true,
      count: apps.length,
      data: apps
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
