import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Save, 
  X, 
  Sparkles, 
  Check,
  Tag
} from 'lucide-react';
import { formatDigitalTimer } from '../utils/formatters';
import AppIcon from './AppIcon';

const QUICK_APPS = [
  { name: 'VS Code', cat: 'coding' },
  { name: 'Spotify', cat: 'music' },
  { name: 'Google Chrome', cat: 'work' },
  { name: 'Terminal', cat: 'coding' },
  { name: 'Cursor', cat: 'coding' },
  { name: 'Slack', cat: 'work' }
];

export default function LiveTimer({
  isOpen,
  onClose,
  timerSeconds,
  isTimerActive,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onSaveTimerActivity
}) {
  const [appName, setAppName] = useState('VS Code');
  const [title, setTitle] = useState('Developing Activity Tracker');
  const [category, setCategory] = useState('coding');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleQuickAppSelect = (app) => {
    setAppName(app.name);
    setCategory(app.cat);
  };

  const handleSave = async () => {
    if (timerSeconds < 3) {
      alert('Timer duration is too short to log (minimum 3 seconds).');
      return;
    }
    setSaving(true);
    try {
      await onSaveTimerActivity({
        appName: appName.trim() || 'Custom App',
        title: title.trim() || `${appName} session`,
        category,
        duration: timerSeconds,
        notes: notes.trim(),
        endTime: new Date().toISOString(),
        startTime: new Date(Date.now() - timerSeconds * 1000).toISOString()
      });
      onResetTimer();
      onClose();
    } catch (err) {
      console.error('Failed to save activity:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-900/90 border border-sky-500/30 rounded-3xl p-5 md:p-6 shadow-xl shadow-cyan-950/20 relative backdrop-blur-md">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Left: Stopwatch Display & Controls */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 live-indicator"></span>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
              Live Activity Stopwatch
            </span>
          </div>

          <div className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-100 tracking-tight my-2">
            {formatDigitalTimer(timerSeconds)}
          </div>

          <div className="flex items-center gap-2 mt-2">
            {!isTimerActive ? (
              <button
                onClick={onStartTimer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start</span>
              </button>
            ) : (
              <button
                onClick={onPauseTimer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={onResetTimer}
              disabled={timerSeconds === 0}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSave}
              disabled={timerSeconds < 3 || saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Activity'}</span>
            </button>
          </div>
        </div>

        {/* Right: Activity Details Inputs */}
        <div className="flex-1 w-full lg:max-w-xl bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-sky-400" />
            <span>Activity Metadata</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Application Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-2.5 pointer-events-none">
                  <AppIcon appName={appName} category={category} size="xs" />
                </div>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. VS Code, Spotify"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
              >
                <option value="coding">⌨️ Coding</option>
                <option value="music">🎵 Music / Media</option>
                <option value="work">💼 Work / Docs</option>
                <option value="study">📚 Learning / Research</option>
                <option value="other">◈ Other</option>
              </select>
            </div>
          </div>

          {/* Quick presets */}
          <div className="mb-3">
            <label className="block text-[10px] text-slate-500 mb-1">Quick Select:</label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_APPS.map((app) => (
                <button
                  key={app.name}
                  type="button"
                  onClick={() => handleQuickAppSelect(app)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] transition-colors border ${
                    appName === app.name
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-medium'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  <AppIcon appName={app.name} category={app.cat} size="xs" />
                  <span>{app.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Activity Title / Window Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Working on React Frontend components"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
