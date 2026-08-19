export const CATEGORY_INFO = {
  coding: {
    label: 'Coding',
    icon: '⌨️',
    color: '#38bdf8',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    bgColor: 'bg-sky-500/10',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
  },
  music: {
    label: 'Music / Media',
    icon: '🎵',
    color: '#a78bfa',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  },
  work: {
    label: 'Work / Docs',
    icon: '💼',
    color: '#34d399',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  },
  study: {
    label: 'Learning / Research',
    icon: '📚',
    color: '#f59e0b',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  other: {
    label: 'Other',
    icon: '◈',
    color: '#94a3b8',
    textColor: 'text-slate-400',
    borderColor: 'border-slate-500/30',
    bgColor: 'bg-slate-500/10',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  }
};

export function getCategoryInfo(category) {
  const key = (category || 'other').toLowerCase();
  return CATEGORY_INFO[key] || CATEGORY_INFO.other;
}

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0m';
  const sec = Math.floor(seconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSecs = sec % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return remainingSecs > 0 && minutes < 5 ? `${minutes}m ${remainingSecs}s` : `${minutes}m`;
  }
  return `${remainingSecs}s`;
}

export function formatDurationDetailed(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const sec = Math.floor(seconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSecs = sec % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSecs > 0 || parts.length === 0) parts.push(`${remainingSecs}s`);
  return parts.join(' ');
}

export function formatDigitalTimer(seconds) {
  const sec = Math.floor(seconds || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
}

export function formatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function getAppIconEmoji(appName = '') {
  const n = appName.toLowerCase();
  if (/code|vs code|visual studio|pycharm|cursor|vim|neovim|intellij|sublime|ide|git|terminal|bash|zsh/.test(n)) {
    return '⌨️';
  }
  if (/spotify|music|youtube|apple music|soundcloud|vlc|podcast|audio|tidal/.test(n)) {
    return '🎵';
  }
  if (/chrome|firefox|brave|safari|edge|browser|web/.test(n)) {
    return '🌐';
  }
  if (/slack|discord|teams|telegram|zoom|meet|chat|skype/.test(n)) {
    return '💬';
  }
  if (/figma|sketch|photoshop|canva|design|illustrator/.test(n)) {
    return '🎨';
  }
  if (/notion|obsidian|docs|sheets|word|excel|trello|jira/.test(n)) {
    return '📝';
  }
  return '📦';
}

export function detectCategory(appName = '', title = '') {
  const target = `${appName} ${title}`.toLowerCase();
  if (/code|visual studio|pycharm|cursor|intellij|vim|terminal|git|sublime/.test(target)) return 'coding';
  if (/spotify|music|youtube|apple music|audio|sound|podcast/.test(target)) return 'music';
  if (/chrome|firefox|slack|figma|notion|jira|teams|meet|docs/.test(target)) return 'work';
  if (/study|learn|book|research|course/.test(target)) return 'study';
  return 'other';
}
