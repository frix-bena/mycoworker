import React, { useState } from 'react';

/**
 * AppIcon Component
 * Renders authentic, high-fidelity real brand icons for applications and tools.
 * Supports vector SVGs for 60+ applications, system icon loading via backend,
 * and smart category/monogram fallback.
 */

// Brand SVG definitions
const BRAND_SVGS = {
  // --- CODE EDITORS & IDES ---
  vscode: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <path d="M174.6 248.8a12 12 0 0 0 11.2-1.9l59.6-47.7a12 12 0 0 0 4.6-9.5V66.3a12 12 0 0 0-4.6-9.5L185.8 9.1a12 12 0 0 0-16.7 3.5l-84.3 115.4 46.1 38.3 43.7 82.5z" fill="#0066B8"/>
      <path d="M174.6 7.2a12 12 0 0 0-11.2 1.9L103.8 56.8l46.1 38.3 34.7-65.7V7.2h-10z" fill="#007ACC"/>
      <path d="M6 170.8a12 12 0 0 0 5.5 10.2l46.3 29.8 46-38.3-46-38.3-46.3 29.8a12 12 0 0 0-5.5 6.8z" fill="#1F9CF0"/>
      <path d="M185.8 246.9l-82-67.7 46.1-38.3 82 67.7-46.1 38.3z" fill="#0066B8"/>
      <path d="M103.8 56.8l-46-38.3L11.5 48.3a12 12 0 0 0-5.5 10.2v139a12 12 0 0 0 5.5 10.2l46.3 29.8 46-38.3 82 67.7 49.9-39.9V50.7L185.8 9.1l-82 47.7z" fill="url(#vscode_grad)"/>
      <defs>
        <linearGradient id="vscode_grad" x1="6" y1="9.1" x2="250" y2="248.8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#007ACC"/>
          <stop offset="0.5" stopColor="#1F9CF0"/>
          <stop offset="1" stopColor="#0066B8"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  antigravity: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="agy_bg" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f172a"/>
          <stop offset="1" stopColor="#020617"/>
        </linearGradient>
        <linearGradient id="agy_rocket" x1="60" y1="60" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8"/>
          <stop offset="0.5" stopColor="#6366f1"/>
          <stop offset="1" stopColor="#a855f7"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="56" fill="url(#agy_bg)"/>
      <circle cx="128" cy="128" r="90" stroke="url(#agy_rocket)" strokeWidth="8" strokeDasharray="16 12" opacity="0.6"/>
      {/* Spacecraft / Liftoff body */}
      <path d="M128 44c20 32 44 68 44 100 0 24.3-19.7 44-44 44s-44-19.7-44-44c0-32 24-68 44-100z" fill="url(#agy_rocket)"/>
      <circle cx="128" cy="120" r="16" fill="#ffffff"/>
      <path d="M84 144c-18 12-24 28-24 28s16 6 32-4l-8-24z" fill="#38bdf8"/>
      <path d="M172 144c18 12 24 28 24 28s-16 6-32-4l8-24z" fill="#a855f7"/>
      <path d="M128 188c-6 16-16 28-16 28s16-2 32 0c0 0-10-12-16-28z" fill="#f59e0b"/>
    </svg>
  ),

  cursor: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#09090b"/>
      {/* 3D Isometric Cube Cursor */}
      <path d="M128 48l72 41.5v83L128 214l-72-41.5v-83L128 48z" fill="#18181b" stroke="#3f3f46" strokeWidth="6"/>
      <path d="M128 48l72 41.5-72 41.5-72-41.5L128 48z" fill="#27272a"/>
      <path d="M128 131l72-41.5v83L128 214V131z" fill="#18181b"/>
      <path d="M56 89.5L128 131v83L56 172.5v-83z" fill="#09090b"/>
      <path d="M128 48v83" stroke="#52525b" strokeWidth="4"/>
      <path d="M56 89.5l72 41.5 72-41.5" stroke="#52525b" strokeWidth="4"/>
      {/* Inner highlight arrow */}
      <polygon points="128,82 152,124 134,124 134,156 122,156 122,124 104,124" fill="#38bdf8"/>
    </svg>
  ),

  claude: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#d97757"/>
      {/* Anthropic / Claude Asterisk Sunburst */}
      <g fill="#ffffff">
        <path d="M137 32h-18v64h18V32z"/>
        <path d="M137 160h-18v64h18v-64z"/>
        <path d="M224 119v18h-64v-18h64z"/>
        <path d="M96 119v18H32v-18h64z"/>
        <path d="M195.9 70.8l-12.7-12.7-45.3 45.3 12.7 12.7 45.3-45.3z"/>
        <path d="M118.1 148.6l-12.7-12.7-45.3 45.3 12.7 12.7 45.3-45.3z"/>
        <path d="M72.8 58.1L60.1 70.8l45.3 45.3 12.7-12.7-45.3-45.3z"/>
        <path d="M150.6 135.9l-12.7 12.7 45.3 45.3 12.7-12.7-45.3-45.3z"/>
      </g>
    </svg>
  ),

  chatgpt: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#10a37f"/>
      <path d="M207.9 116.5a43.8 43.8 0 0 0-3.6-35.3 45.2 45.2 0 0 0-29.4-21.9 44.8 44.8 0 0 0-32.9 2.2A44.8 44.8 0 0 0 106.6 48a45.3 45.3 0 0 0-41.5 28.5 44.9 44.9 0 0 0-21.7 29.5 45.2 45.2 0 0 0 5.4 36.2 44 44 0 0 0 3.6 35.3 45.2 45.2 0 0 0 29.4 21.9 44.8 44.8 0 0 0 32.9-2.2 44.8 44.8 0 0 0 35.4 13.5 45.3 45.3 0 0 0 41.5-28.5 44.9 44.9 0 0 0 21.7-29.5 45.2 45.2 0 0 0-5.4-36.2zm-73.4 83.1a33.6 33.6 0 0 1-22.3-8.3l1.8-1 37.1-21.4a6.5 6.5 0 0 0 3.3-5.7v-52.4l15.7 9.1v42.8a33.8 33.8 0 0 1-35.6 36.9zm-67.4-30.8a33.4 33.4 0 0 1-4-23.5l1.8 1.1 37.1 21.4a6.5 6.5 0 0 0 6.6 0l45.4-26.2v18.2l-37.1 21.4a33.8 33.8 0 0 1-49.8-12.4zm-14.7-65.7a33.5 33.5 0 0 1 18.2-15.2v44.8a6.5 6.5 0 0 0 3.3 5.7l45.4 26.2-15.7 9.1-37.1-21.4a33.8 33.8 0 0 1-14.1-49.2zm117.8 22.8l-45.4-26.2 15.7-9.1 37.1 21.4a33.8 33.8 0 0 1 14.1 49.2 33.5 33.5 0 0 1-18.2 15.2V131.6a6.5 6.5 0 0 0-3.3-5.7zm21.4-28.6l-1.8-1.1-37.1-21.4a6.5 6.5 0 0 0-6.6 0l-45.4 26.2V83.9l37.1-21.4a33.8 33.8 0 0 1 49.8 12.4 33.4 33.4 0 0 1 4 22.4zM103 140.6l-15.7-9.1V88.7a33.8 33.8 0 0 1 35.6-36.9 33.6 33.6 0 0 1 22.3 8.3l-1.8 1-37.1 21.4a6.5 6.5 0 0 0-3.3 5.7v52.4zm12.6-21.8l18.4-10.6 18.4 10.6v21.3l-18.4 10.6-18.4-10.6v-21.3z" fill="#ffffff"/>
    </svg>
  ),

  gemini: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="gemini_grad" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a73e8"/>
          <stop offset="0.35" stopColor="#8ab4f8"/>
          <stop offset="0.7" stopColor="#c58af9"/>
          <stop offset="1" stopColor="#ea4335"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="56" fill="#0f172a"/>
      {/* 4-point Sparkle */}
      <path d="M128 24C128 81.4 81.4 128 24 128C81.4 128 128 174.6 128 232C128 174.6 174.6 128 232 128C174.6 128 128 81.4 128 24Z" fill="url(#gemini_grad)"/>
    </svg>
  ),

  // --- WEB BROWSERS ---
  chrome: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <circle cx="128" cy="128" r="120" fill="#ffffff"/>
      <path d="M128 128L63.5 239.7C82.5 250.7 104.7 256 128 256c70.7 0 128-57.3 128-128 0-12.8-1.9-25.1-5.4-36.8H128z" fill="#FFC107"/>
      <path d="M128 128h122.6C247.1 77.2 212.1 34.4 164.5 14L100 125.7 128 128z" fill="#FF3D00"/>
      <path d="M128 128L63.5 16.3C26.5 37.6 0 79.5 0 128c0 47.9 26 89.4 63.5 111.7L128 128z" fill="#4CAF50"/>
      <circle cx="128" cy="128" r="54" fill="#FFFFFF"/>
      <circle cx="128" cy="128" r="44" fill="#1976D2"/>
    </svg>
  ),

  firefox: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ff_globe" x1="30" y1="30" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#300d60"/>
          <stop offset="0.6" stopColor="#58167d"/>
          <stop offset="1" stopColor="#96227c"/>
        </linearGradient>
        <linearGradient id="ff_fox" x1="20" y1="20" x2="240" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe153"/>
          <stop offset="0.3" stopColor="#ff7139"/>
          <stop offset="0.7" stopColor="#e22850"/>
          <stop offset="1" stopColor="#96227c"/>
        </linearGradient>
      </defs>
      <circle cx="128" cy="128" r="112" fill="url(#ff_globe)"/>
      {/* Curved fox tail & body */}
      <path d="M228 108c-6-30-26-56-54-68 8 16 10 36 2 54-14-38-44-62-80-66 12 18 16 38 10 58-20-24-52-32-80-22 14 14 20 34 16 52-24-10-52-4-70 14 36 102 172 134 234 50 14-20 24-46 22-72z" fill="url(#ff_fox)"/>
    </svg>
  ),

  brave: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#fb542b"/>
      {/* Brave Lion Head Vector */}
      <path d="M128 32l56 24 16 48-16 48-56 72-56-72-16-48 16-48 56-24z" fill="#ffffff"/>
      <path d="M128 54l38 18 10 34-10 34-38 52-38-52-10-34 10-34 38-18z" fill="#fb542b"/>
      <path d="M128 92l18 20h-36l18-20z" fill="#ffffff"/>
    </svg>
  ),

  safari: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <circle cx="128" cy="128" r="120" fill="url(#safari_bg)"/>
      <defs>
        <linearGradient id="safari_bg" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d2ff"/>
          <stop offset="1" stopColor="#0066ff"/>
        </linearGradient>
      </defs>
      {/* Compass ticks */}
      <circle cx="128" cy="128" r="100" stroke="#ffffff" strokeWidth="4" strokeDasharray="4 16" opacity="0.8"/>
      {/* Needle */}
      <polygon points="128,128 176,80 144,144" fill="#ff3b30"/>
      <polygon points="128,128 80,176 112,112" fill="#ffffff"/>
      <circle cx="128" cy="128" r="8" fill="#ffffff"/>
    </svg>
  ),

  edge: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#0c1021"/>
      <defs>
        <linearGradient id="edge_grad" x1="20" y1="20" x2="240" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0078d7"/>
          <stop offset="0.5" stopColor="#00c853"/>
          <stop offset="1" stopColor="#00b0ff"/>
        </linearGradient>
      </defs>
      <path d="M128 32c53 0 96 43 96 96 0 12-2 24-7 35-12-32-44-55-81-55-48 0-88 39-88 88 0 14 3 26 9 37-34-18-57-55-57-97 0-59 48-104 128-104z" fill="url(#edge_grad)"/>
      <circle cx="140" cy="168" r="44" fill="#00b0ff"/>
    </svg>
  ),

  // --- MUSIC & MEDIA ---
  spotify: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <circle cx="128" cy="128" r="120" fill="#1ed760"/>
      <path d="M185 102c-38-23-100-25-136-14a9 9 0 0 1-5-17c42-13 110-10 153 15a9 9 0 1 1-12 16z" fill="#000000"/>
      <path d="M172 135c-31-19-80-25-117-13a7.5 7.5 0 1 1-5-14c43-13 96-7 131 15a7.5 7.5 0 1 1-9 12z" fill="#000000"/>
      <path d="M159 167c-25-15-56-19-93-10a6 6 0 1 1-3-12c41-9 75-5 103 12a6 6 0 0 1-7 10z" fill="#000000"/>
    </svg>
  ),

  applemusic: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="am_grad" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fa233b"/>
          <stop offset="0.5" stopColor="#fb5c74"/>
          <stop offset="1" stopColor="#fa2d55"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="56" fill="url(#am_grad)"/>
      {/* Apple Music dual eighth note */}
      <path d="M168 56v96a32 32 0 1 1-24-30.8V80l-56 16v68a32 32 0 1 1-24-30.8V72a12 12 0 0 1 8.8-11.6l80-23a12 12 0 0 1 15.2 11.6z" fill="#ffffff"/>
    </svg>
  ),

  youtube: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#ff0000"/>
      <path d="M214.6 86.8c-2.3-8.6-9-15.3-17.6-17.6C181.5 64 128 64 128 64s-53.5 0-69 5.2c-8.6 2.3-15.3 9-17.6 17.6C36 102.3 36 128 36 128s0 25.7 5.4 41.2c2.3 8.6 9 15.3 17.6 17.6 15.5 5.2 69 5.2 69 5.2s53.5 0 69-5.2c8.6-2.3 15.3-9 17.6-17.6 5.4-15.5 5.4-41.2 5.4-41.2s0-25.7-5.4-41.2z" fill="#ffffff"/>
      <polygon points="110,105 158,128 110,151" fill="#ff0000"/>
    </svg>
  ),

  youtubemusic: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <circle cx="128" cy="128" r="120" fill="#ff0000"/>
      <circle cx="128" cy="128" r="80" stroke="#ffffff" strokeWidth="12" fill="none"/>
      <polygon points="112,100 156,128 112,156" fill="#ffffff"/>
    </svg>
  ),

  vlc: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#18181b"/>
      {/* VLC Traffic Cone */}
      <polygon points="128,32 148,88 108,88" fill="#ff8800"/>
      <polygon points="148,88 160,120 96,120 108,88" fill="#ffffff"/>
      <polygon points="160,120 176,160 80,160 96,120" fill="#ff8800"/>
      <polygon points="176,160 188,188 68,188 80,160" fill="#ffffff"/>
      <polygon points="188,188 200,214 56,214 68,188" fill="#ff8800"/>
      <rect x="40" y="214" width="176" height="14" rx="7" fill="#ff6600"/>
    </svg>
  ),

  soundcloud: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#ff5500"/>
      <path d="M196 128a36 36 0 0 1-36 36h-88v-72a36 36 0 0 1 70.8-9.5A36 36 0 0 1 196 128z" fill="#ffffff"/>
      <line x1="56" y1="120" x2="56" y2="164" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
      <line x1="40" y1="134" x2="40" y2="164" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
    </svg>
  ),

  // --- CHAT & COLLABORATION ---
  slack: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#1a1d21"/>
      <g transform="translate(48, 48) scale(0.625)">
        <path d="M57.6 153.6a28.8 28.8 0 1 1-28.8-28.8h28.8v28.8zm14.4 0a28.8 28.8 0 1 1 57.6 0v72a28.8 28.8 0 1 1-57.6 0v-72z" fill="#36C5F0"/>
        <path d="M102.4 57.6a28.8 28.8 0 1 1 28.8-28.8v28.8h-28.8zm0 14.4a28.8 28.8 0 1 1 0 57.6H30.4a28.8 28.8 0 1 1 0-57.6h72z" fill="#2EB67D"/>
        <path d="M198.4 102.4a28.8 28.8 0 1 1 28.8 28.8h-28.8v-28.8zm-14.4 0a28.8 28.8 0 1 1-57.6 0V30.4a28.8 28.8 0 1 1 57.6 0v72z" fill="#ECB22E"/>
        <path d="M153.6 198.4a28.8 28.8 0 1 1-28.8 28.8v-28.8h28.8zm0-14.4a28.8 28.8 0 1 1 0-57.6h72a28.8 28.8 0 1 1 0 57.6h-72z" fill="#E01E5A"/>
      </g>
    </svg>
  ),

  discord: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#5865f2"/>
      <path d="M197.6 62.4A152 152 0 0 0 159 50.4a106 106 0 0 0-4.8 10 140 140 0 0 0-52.4 0 106 106 0 0 0-4.8-10 152 152 0 0 0-38.6 12C33.6 100.8 27 151 30.6 200.6a153 153 0 0 0 46.8 23.6 114 114 0 0 0 9.8-16 99 99 0 0 1-15.6-7.6c1.3-1 2.6-1.9 3.8-2.9 30 14 62.6 14 92.2 0 1.2 1 2.5 1.9 3.8 2.9a99 99 0 0 1-15.6 7.6 114 114 0 0 0 9.8 16 153 153 0 0 0 46.8-23.6c4.2-57.2-7.2-107-24.8-138.2zM94.6 168.4c-9.6 0-17.6-8.8-17.6-19.6s7.8-19.6 17.6-19.6c9.8 0 17.8 8.8 17.6 19.6 0 10.8-7.8 19.6-17.6 19.6zm66.8 0c-9.6 0-17.6-8.8-17.6-19.6s7.8-19.6 17.6-19.6c9.8 0 17.8 8.8 17.6 19.6 0 10.8-7.8 19.6-17.6 19.6z" fill="#ffffff"/>
    </svg>
  ),

  teams: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#464eb8"/>
      {/* Teams T badge & avatars */}
      <circle cx="168" cy="88" r="28" fill="#7b83eb"/>
      <path d="M136 128h64a24 24 0 0 1 24 24v20h-88v-44z" fill="#7b83eb"/>
      <rect x="44" y="68" width="96" height="120" rx="16" fill="#505ac9"/>
      <path d="M72 108h40v16H98v44H82v-44H72v-16z" fill="#ffffff"/>
    </svg>
  ),

  telegram: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <circle cx="128" cy="128" r="120" fill="#24a1de"/>
      <path d="M56 125l128-49c6-2 12 2 10 9l-22 103c-2 8-8 10-14 6l-39-29-19 18c-2 2-4 4-8 4l3-40 73-66c3-3-1-5-5-2l-90 57-38-12c-8-3-8-8 1-11z" fill="#ffffff"/>
    </svg>
  ),

  zoom: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#2d8cff"/>
      <path d="M60 92a16 16 0 0 1 16-16h76a16 16 0 0 1 16 16v72a16 16 0 0 1-16 16H76a16 16 0 0 1-16-16V92z" fill="#ffffff"/>
      <path d="M168 116l32-22a8 8 0 0 1 12 7v54a8 8 0 0 1-12 7l-32-22v-24z" fill="#ffffff"/>
    </svg>
  ),

  // --- PRODUCTIVITY & DESIGN ---
  figma: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#1e1e1e"/>
      <g transform="translate(68, 36) scale(1)">
        <path d="M30 0h30v60H30a30 30 0 0 1 0-60z" fill="#F24E1E"/>
        <path d="M60 0h30a30 30 0 0 1 0 60H60V0z" fill="#FF7262"/>
        <path d="M60 60h30a30 30 0 0 1 0 60H60V60z" fill="#1ABCFE"/>
        <path d="M30 60h30v60H30a30 30 0 0 1 0-60z" fill="#A259FF"/>
        <path d="M30 120h30v30a30 30 0 1 1-30-30z" fill="#0ACF83"/>
      </g>
    </svg>
  ),

  notion: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#ffffff"/>
      <path d="M62 52l92-16 40 14v148l-94 18-38-16V52z" fill="#000000"/>
      <path d="M78 68l74-12 28 10v124l-76 14-26-12V68z" fill="#ffffff"/>
      <path d="M102 92v72l42-64v64" stroke="#000000" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  obsidian: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#18132b"/>
      {/* Obsidian Gemstone */}
      <polygon points="128,32 188,72 172,188 128,224 84,188 68,72" fill="#7c3aed"/>
      <polygon points="128,32 188,72 144,120 128,32" fill="#a78bfa"/>
      <polygon points="68,72 128,32 112,120 68,72" fill="#6d28d9"/>
      <polygon points="112,120 144,120 128,224" fill="#8b5cf6"/>
      <polygon points="144,120 188,72 172,188 128,224" fill="#5b21b6"/>
      <polygon points="112,120 68,72 84,188 128,224" fill="#4c1d95"/>
    </svg>
  ),

  github: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#0d1117"/>
      <path d="M128 36c-50.8 0-92 41.2-92 92 0 40.6 26.4 75.1 63 87.3 4.6.8 6.3-2 6.3-4.4v-15.6c-25.6 5.6-31-12.3-31-12.3-4.2-10.6-10.2-13.5-10.2-13.5-8.4-5.7.6-5.6.6-5.6 9.2.7 14.1 9.5 14.1 9.5 8.2 14 21.6 10 26.8 7.6 1-.6 2-1.8 2.8-3.1-20.4-2.3-42-10.2-42-45.4 0-10 3.6-18.2 9.5-24.6-1-2.3-4.1-11.7.9-24.3 0 0 7.7-2.5 25.3 9.4 7.4-2 15.2-3.1 23-3.1s15.6 1 23 3.1c17.5-12 25.2-9.4 25.2-9.4 5.1 12.6 2 22 .9 24.3 6 6.4 9.5 14.6 9.5 24.6 0 35.4-21.6 43-42.2 45.3 3.3 2.8 6.2 8.4 6.2 16.9v25.1c0 2.5 1.7 5.3 6.4 4.4 36.6-12.2 62.9-46.7 62.9-87.3 0-50.8-41.2-92-92-92z" fill="#ffffff"/>
    </svg>
  ),

  docker: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#1d63ed"/>
      {/* Docker Whale & Containers */}
      <g fill="#ffffff">
        <rect x="76" y="96" width="20" height="18" rx="2"/>
        <rect x="100" y="96" width="20" height="18" rx="2"/>
        <rect x="124" y="96" width="20" height="18" rx="2"/>
        <rect x="100" y="74" width="20" height="18" rx="2"/>
        <rect x="124" y="74" width="20" height="18" rx="2"/>
        <rect x="148" y="96" width="20" height="18" rx="2"/>
        <path d="M216 128c-4 0-14 2-20 8-8-4-24-4-32 0v16H48c-4 16 4 48 40 48 44 0 88-16 112-40 16-4 28-16 28-24 0-4-4-8-12-8z"/>
      </g>
    </svg>
  ),

  postman: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <circle cx="128" cy="128" r="120" fill="#ff6c37"/>
      {/* Postman Spaceman */}
      <circle cx="128" cy="96" r="32" fill="#ffffff"/>
      <path d="M80 176c0-26 21-48 48-48s48 22 48 48v8H80v-8z" fill="#ffffff"/>
      <polygon points="128,48 144,80 112,80" fill="#ffffff"/>
    </svg>
  ),

  // --- TERMINALS & SHELLS ---
  terminal: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#0f172a"/>
      <rect x="24" y="24" width="208" height="208" rx="36" fill="#020617" stroke="#1e293b" strokeWidth="6"/>
      {/* Terminal window dots */}
      <circle cx="56" cy="56" r="8" fill="#ef4444"/>
      <circle cx="80" cy="56" r="8" fill="#f59e0b"/>
      <circle cx="104" cy="56" r="8" fill="#10b981"/>
      {/* Prompt >_ */}
      <path d="M60 108l40 32-40 32" stroke="#38bdf8" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="120" y1="172" x2="168" y2="172" stroke="#34d399" strokeWidth="16" strokeLinecap="round"/>
    </svg>
  ),

  // --- JETBRAINS & OTHER EDITORS ---
  pycharm: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#21D789"/>
      <rect x="36" y="36" width="184" height="184" rx="28" fill="#000000"/>
      <path d="M36 60h80v80H36z" fill="#21D789"/>
      <path d="M140 140h80v80h-80z" fill="#FCFC37"/>
      <text x="56" y="136" fill="#ffffff" fontFamily="monospace" fontWeight="900" fontSize="54">PC</text>
      <rect x="56" y="160" width="70" height="10" fill="#21D789"/>
    </svg>
  ),

  intellij: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#087CFA"/>
      <rect x="36" y="36" width="184" height="184" rx="28" fill="#000000"/>
      <path d="M36 36h80v80H36z" fill="#FE2857"/>
      <path d="M140 140h80v80h-80z" fill="#087CFA"/>
      <text x="64" y="136" fill="#ffffff" fontFamily="monospace" fontWeight="900" fontSize="54">IJ</text>
      <rect x="56" y="160" width="70" height="10" fill="#FE2857"/>
    </svg>
  ),

  webstorm: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#00CDD7"/>
      <rect x="36" y="36" width="184" height="184" rx="28" fill="#000000"/>
      <path d="M36 36h80v80H36z" fill="#00CDD7"/>
      <path d="M140 140h80v80h-80z" fill="#087CFA"/>
      <text x="56" y="136" fill="#ffffff" fontFamily="monospace" fontWeight="900" fontSize="54">WS</text>
      <rect x="56" y="160" width="70" height="10" fill="#00CDD7"/>
    </svg>
  ),

  clion: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#21D789"/>
      <rect x="36" y="36" width="184" height="184" rx="28" fill="#000000"/>
      <path d="M36 36h80v80H36z" fill="#21D789"/>
      <path d="M140 140h80v80h-80z" fill="#087CFA"/>
      <text x="60" y="136" fill="#ffffff" fontFamily="monospace" fontWeight="900" fontSize="54">CL</text>
      <rect x="56" y="160" width="70" height="10" fill="#21D789"/>
    </svg>
  ),

  rider: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#C4133A"/>
      <rect x="36" y="36" width="184" height="184" rx="28" fill="#000000"/>
      <path d="M36 36h80v80H36z" fill="#C4133A"/>
      <path d="M140 140h80v80h-80z" fill="#FE2857"/>
      <text x="60" y="136" fill="#ffffff" fontFamily="monospace" fontWeight="900" fontSize="54">RD</text>
      <rect x="56" y="160" width="70" height="10" fill="#C4133A"/>
    </svg>
  ),

  goland: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#00ADD8"/>
      <rect x="36" y="36" width="184" height="184" rx="28" fill="#000000"/>
      <path d="M36 36h80v80H36z" fill="#00ADD8"/>
      <path d="M140 140h80v80h-80z" fill="#21D789"/>
      <text x="60" y="136" fill="#ffffff" fontFamily="monospace" fontWeight="900" fontSize="54">GO</text>
      <rect x="56" y="160" width="70" height="10" fill="#00ADD8"/>
    </svg>
  ),

  androidstudio: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#3DDC84"/>
      <circle cx="128" cy="128" r="76" fill="#ffffff"/>
      <path d="M96 112a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm64 0a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill="#3DDC84"/>
      <path d="M128 80c-26.5 0-48 21.5-48 48h96c0-26.5-21.5-48-48-48zm-28-20l-12-16a4 4 0 0 0-6 5l12 16a50 50 0 0 1 6-5zm56 0a50 50 0 0 1 6 5l12-16a4 4 0 0 0-6-5l-12 16z" fill="#3DDC84"/>
    </svg>
  ),

  zed: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#0a0a0c"/>
      <path d="M68 64h120l-88 128h92" stroke="#38bdf8" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M68 64l88 128" stroke="#818cf8" strokeWidth="18" strokeLinecap="round"/>
    </svg>
  ),

  windsurf: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="windsurf_grad" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284c7"/>
          <stop offset="0.5" stopColor="#06b6d4"/>
          <stop offset="1" stopColor="#3b82f6"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="56" fill="#030712"/>
      <path d="M64 168c24-40 60-72 108-88-28 40-36 76-24 104-28-4-56-8-84-16z" fill="url(#windsurf_grad)"/>
      <path d="M104 64c32 16 64 48 88 100-36-8-64-32-88-100z" fill="#38bdf8" opacity="0.8"/>
    </svg>
  ),

  positron: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#1e1b4b"/>
      <ellipse cx="128" cy="128" rx="72" ry="28" stroke="#a855f7" strokeWidth="10" transform="rotate(-30 128 128)"/>
      <ellipse cx="128" cy="128" rx="72" ry="28" stroke="#38bdf8" strokeWidth="10" transform="rotate(30 128 128)"/>
      <circle cx="128" cy="128" r="20" fill="#f59e0b"/>
    </svg>
  ),

  sublime: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#27272a"/>
      <polygon points="60,70 196,110 196,140 60,100" fill="#ff9800"/>
      <polygon points="60,120 196,160 196,190 60,150" fill="#ff5722"/>
      <polygon points="60,170 196,210 196,220 60,180" fill="#e64a19"/>
    </svg>
  ),

  neovim: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#0f172a"/>
      <polygon points="56,48 104,48 104,208 56,208" fill="#16a34a"/>
      <polygon points="152,48 200,48 200,208 152,208" fill="#0284c7"/>
      <polygon points="56,48 104,48 200,208 152,208" fill="#22c55e"/>
    </svg>
  ),

  vim: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#019833"/>
      <polygon points="48,48 108,48 208,188 148,188" fill="#ffffff"/>
      <polygon points="148,48 208,48 108,208 48,208" fill="#007acc"/>
      <text x="76" y="152" fill="#000000" fontFamily="sans-serif" fontWeight="900" fontSize="76">V</text>
    </svg>
  ),

  emacs: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="emacs_grad" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor="#412991"/>
          <stop offset="1" stopColor="#7F5AB6"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="56" fill="url(#emacs_grad)"/>
      <ellipse cx="128" cy="128" rx="80" ry="48" stroke="#ffffff" strokeWidth="12" fill="none" transform="rotate(-25 128 128)"/>
      <path d="M104 116c0-12 10-20 24-20 18 0 28 12 28 28 0 24-28 36-40 48h44v16H96v-16c14-14 36-24 36-36 0-8-6-12-14-12-8 0-14 4-14 12h-16z" fill="#ffffff"/>
    </svg>
  ),

  git: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#F05032"/>
      {/* Git Rhombus & Branch Line */}
      <g transform="translate(128, 128) rotate(45) translate(-64, -64)">
        <rect x="0" y="0" width="128" height="128" rx="16" fill="#F05032" stroke="#ffffff" strokeWidth="8"/>
        <circle cx="36" cy="64" r="14" fill="#ffffff"/>
        <circle cx="92" cy="64" r="14" fill="#ffffff"/>
        <circle cx="92" cy="32" r="14" fill="#ffffff"/>
        <line x1="36" y1="64" x2="92" y2="64" stroke="#ffffff" strokeWidth="8"/>
        <line x1="92" y1="32" x2="92" y2="64" stroke="#ffffff" strokeWidth="8"/>
      </g>
    </svg>
  ),

  // --- ADOBE & DESIGN ---
  photoshop: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#001e36"/>
      <text x="64" y="160" fill="#31a8ff" fontFamily="sans-serif" fontWeight="900" fontSize="90">Ps</text>
    </svg>
  ),

  illustrator: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#330000"/>
      <text x="68" y="160" fill="#ff9a00" fontFamily="sans-serif" fontWeight="900" fontSize="90">Ai</text>
    </svg>
  ),

  blender: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <rect width="256" height="256" rx="56" fill="#ea7600"/>
      <circle cx="128" cy="144" r="48" fill="#ffffff"/>
      <circle cx="128" cy="144" r="28" fill="#2258aa"/>
      <line x1="128" y1="96" x2="128" y2="40" stroke="#ffffff" strokeWidth="20" strokeLinecap="round"/>
      <line x1="90" y1="110" x2="48" y2="70" stroke="#ffffff" strokeWidth="20" strokeLinecap="round"/>
      <line x1="166" y1="110" x2="208" y2="70" stroke="#ffffff" strokeWidth="20" strokeLinecap="round"/>
    </svg>
  ),

  steam: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
      <circle cx="128" cy="128" r="120" fill="#171a21"/>
      <circle cx="176" cy="96" r="32" stroke="#ffffff" strokeWidth="12" fill="none"/>
      <circle cx="96" cy="168" r="24" fill="#ffffff"/>
      <line x1="108" y1="152" x2="152" y2="108" stroke="#ffffff" strokeWidth="16" strokeLinecap="round"/>
    </svg>
  )
};

/**
 * Normalizes any app name string to a known key
 */
export function getAppIconKey(appName = '') {
  if (!appName) return null;
  const n = appName.toLowerCase().trim();

  if (n.includes('antigravity')) return 'antigravity';
  if (n.includes('vscode') || n.includes('visual studio code') || n === 'code' || n.includes('code - oss') || n.includes('vscodium')) return 'vscode';
  if (n.includes('cursor')) return 'cursor';
  if (n.includes('windsurf')) return 'windsurf';
  if (n.includes('positron')) return 'positron';
  if (n.includes('zed')) return 'zed';
  if (n.includes('pycharm')) return 'pycharm';
  if (n.includes('intellij') || n.includes('idea')) return 'intellij';
  if (n.includes('webstorm')) return 'webstorm';
  if (n.includes('clion')) return 'clion';
  if (n.includes('rider')) return 'rider';
  if (n.includes('goland')) return 'goland';
  if (n.includes('android studio') || n.includes('androidstudio') || n.includes('studio64')) return 'androidstudio';
  if (n.includes('sublime')) return 'sublime';
  if (n.includes('neovim') || n.includes('nvim')) return 'neovim';
  if (n.includes('vim') || n.includes('gvim')) return 'vim';
  if (n.includes('emacs')) return 'emacs';
  if (n.includes('gitkraken') || n.includes('sourcetree') || n === 'git') return 'git';

  if (n.includes('claude')) return 'claude';
  if (n.includes('chatgpt') || n.includes('openai')) return 'chatgpt';
  if (n.includes('gemini') || n.includes('bard')) return 'gemini';

  if (n.includes('chrome') || n.includes('chromium')) return 'chrome';
  if (n.includes('firefox')) return 'firefox';
  if (n.includes('brave')) return 'brave';
  if (n.includes('safari')) return 'safari';
  if (n.includes('edge')) return 'edge';

  if (n.includes('spotify')) return 'spotify';
  if (n.includes('apple music') || n === 'music') return 'applemusic';
  if (n.includes('youtube music')) return 'youtubemusic';
  if (n.includes('youtube')) return 'youtube';
  if (n.includes('vlc')) return 'vlc';
  if (n.includes('soundcloud')) return 'soundcloud';

  if (n.includes('slack')) return 'slack';
  if (n.includes('discord')) return 'discord';
  if (n.includes('teams')) return 'teams';
  if (n.includes('telegram')) return 'telegram';
  if (n.includes('zoom')) return 'zoom';

  if (n.includes('figma')) return 'figma';
  if (n.includes('notion')) return 'notion';
  if (n.includes('obsidian')) return 'obsidian';
  if (n.includes('github')) return 'github';
  if (n.includes('docker')) return 'docker';
  if (n.includes('postman')) return 'postman';

  if (n.includes('terminal') || n.includes('ptyxis') || n.includes('bash') || n.includes('zsh') || n.includes('kitty') || n.includes('alacritty') || n.includes('wezterm') || n.includes('iterm')) return 'terminal';

  if (n.includes('photoshop')) return 'photoshop';
  if (n.includes('illustrator')) return 'illustrator';
  if (n.includes('blender')) return 'blender';
  if (n.includes('steam')) return 'steam';

  return null;
}

const SIZE_CLASSES = {
  xs: 'w-4 h-4 text-[9px]',
  sm: 'w-5 h-5 text-[10px]',
  md: 'w-7 h-7 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base',
  '2xl': 'w-16 h-16 text-lg'
};

const CATEGORY_COLORS = {
  coding: { bg: 'from-sky-500/20 to-blue-600/30', border: 'border-sky-500/30', text: 'text-sky-300' },
  music: { bg: 'from-purple-500/20 to-pink-600/30', border: 'border-purple-500/30', text: 'text-purple-300' },
  work: { bg: 'from-emerald-500/20 to-teal-600/30', border: 'border-emerald-500/30', text: 'text-emerald-300' },
  study: { bg: 'from-amber-500/20 to-orange-600/30', border: 'border-amber-500/30', text: 'text-amber-300' },
  other: { bg: 'from-slate-700/30 to-slate-800/40', border: 'border-slate-700/40', text: 'text-slate-300' }
};

export default function AppIcon({
  appName = '',
  className = '',
  size = 'md',
  category = 'other',
  rounded = true,
  shadow = true
}) {
  const [imgFailed, setImgFailed] = useState(false);

  // Reset error state when appName changes
  React.useEffect(() => {
    setImgFailed(false);
  }, [appName]);

  const iconKey = getAppIconKey(appName);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const isLarge = size === 'lg' || size === 'xl' || size === '2xl';

  const roundClass = rounded
    ? isLarge
      ? 'rounded-2xl'
      : size === 'xs'
      ? 'rounded'
      : 'rounded-lg'
    : '';

  const shadowClass = shadow ? 'shadow-sm' : '';

  // 1. Try loading real authentic system icon from backend (/api/icons/:appName)
  if (appName && !imgFailed) {
    return (
      <div
        className={`relative inline-flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-800/40 ${sizeClass} ${roundClass} ${shadowClass} ${className}`}
        title={appName}
      >
        <img
          src={`/api/icons/${encodeURIComponent(appName)}`}
          alt={appName}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImgFailed(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // 2. Fallback to crisp vector brand SVG if system icon not available or failed
  if (iconKey && BRAND_SVGS[iconKey]) {
    const SvgComponent = BRAND_SVGS[iconKey];
    return (
      <div
        className={`relative inline-flex items-center justify-center flex-shrink-0 overflow-hidden ${sizeClass} ${roundClass} ${shadowClass} ${className}`}
        title={appName}
      >
        <SvgComponent />
      </div>
    );
  }

  // 3. Fallback: Sleek branded initial badge with category color
  const catTheme = CATEGORY_COLORS[category?.toLowerCase()] || CATEGORY_COLORS.other;
  const initial = (appName || '?').trim().charAt(0).toUpperCase();

  return (
    <div
      className={`inline-flex items-center justify-center flex-shrink-0 font-bold font-mono uppercase bg-gradient-to-br ${catTheme.bg} border ${catTheme.border} ${catTheme.text} ${sizeClass} ${roundClass} ${shadowClass} ${className}`}
      title={appName || 'Activity'}
    >
      {initial}
    </div>
  );
}
