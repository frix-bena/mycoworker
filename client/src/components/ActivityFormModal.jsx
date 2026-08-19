import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Save, Calendar, Clock, Tag } from 'lucide-react';
import { detectCategory } from '../utils/formatters';

const COMMON_APPS = [
  { name: 'Visual Studio Code', cat: 'coding' },
  { name: 'Cursor', cat: 'coding' },
  { name: 'Terminal', cat: 'coding' },
  { name: 'Spotify', cat: 'music' },
  { name: 'YouTube Music', cat: 'music' },
  { name: 'Google Chrome', cat: 'work' },
  { name: 'Figma', cat: 'work' },
  { name: 'Slack', cat: 'work' },
  { name: 'Notion', cat: 'study' }
];

export default function ActivityFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingActivity
}) {
  const [appName, setAppName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('coding');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [activityDate, setActivityDate] = useState(new Date().toISOString().slice(0, 10));
  const [activityTime, setActivityTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingActivity) {
      setAppName(editingActivity.appName || '');
      setTitle(editingActivity.title || '');
      setCategory(editingActivity.category || 'coding');
      setDurationMinutes(Math.round((editingActivity.duration || 0) / 60) || 30);
      const st = new Date(editingActivity.startTime || Date.now());
      setActivityDate(st.toISOString().slice(0, 10));
      setActivityTime(st.toTimeString().slice(0, 5));
      setNotes(editingActivity.notes || '');
    } else {
      setAppName('Visual Studio Code');
      setTitle('Developing Activity Tracker Web App');
      setCategory('coding');
      setDurationMinutes(45);
      const now = new Date();
      setActivityDate(now.toISOString().slice(0, 10));
      setActivityTime(now.toTimeString().slice(0, 5));
      setNotes('');
    }
  }, [editingActivity, isOpen]);

  if (!isOpen) return null;

  const handleAppSelect = (app) => {
    setAppName(app.name);
    setCategory(app.cat);
    if (!title || title.includes('session')) {
      setTitle(`${app.name} session`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appName.trim() && !title.trim()) {
      alert('Please specify either an Application Name or Activity Title.');
      return;
    }

    setSubmitting(true);
    try {
      const [hours, mins] = activityTime.split(':').map(Number);
      const startDt = new Date(activityDate);
      startDt.setHours(hours || 0, mins || 0, 0, 0);

      const durationSecs = Math.max(1, Number(durationMinutes) * 60);
      const endDt = new Date(startDt.getTime() + durationSecs * 1000);

      await onSubmit({
        appName: appName.trim() || 'Custom App',
        title: title.trim() || appName.trim(),
        category,
        duration: durationSecs,
        startTime: startDt.toISOString(),
        endTime: endDt.toISOString(),
        notes: notes.trim()
      });

      onClose();
    } catch (err) {
      console.error('Error submitting activity:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0d1424] border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {editingActivity ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {editingActivity ? 'Edit Activity Entry' : 'Log New Activity'}
              </h2>
              <p className="text-xs text-slate-400">
                {editingActivity ? 'Update activity time and metadata' : 'Manually record past time spent on a task'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Quick presets */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Quick Suggestions:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_APPS.map((app) => (
                <button
                  key={app.name}
                  type="button"
                  onClick={() => handleAppSelect(app)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                    appName === app.name
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  {app.name}
                </button>
              ))}
            </div>
          </div>

          {/* App Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Application Name *
              </label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. VS Code, Spotify"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
              >
                <option value="coding">⌨️ Coding</option>
                <option value="music">🎵 Music / Media</option>
                <option value="work">💼 Work / Docs</option>
                <option value="study">📚 Learning / Research</option>
                <option value="other">◈ Other</option>
              </select>
            </div>
          </div>

          {/* Activity / Window Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Activity Title / Window Description
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Building API endpoints in Node.js"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={activityTime}
                onChange={(e) => setActivityTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration (Mins) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any extra context or milestone details..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingActivity ? 'Update Activity' : 'Save Activity'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
