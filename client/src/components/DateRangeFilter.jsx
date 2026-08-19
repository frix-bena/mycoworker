import React from 'react';
import { Calendar, Search, Filter } from 'lucide-react';

export default function DateRangeFilter({
  activePeriod,
  onSelectPeriod,
  customStart,
  customEnd,
  onChangeCustomDate,
  onApplyCustom,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange
}) {
  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'all', label: 'All Time' },
    { id: 'custom', label: 'Custom' }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 shadow-sm">
      {/* Period Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        {periods.map(p => {
          const isActive = activePeriod === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Picker (when custom is selected) */}
      {activePeriod === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <input
            type="date"
            value={customStart}
            onChange={(e) => onChangeCustomDate('start', e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none text-xs"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onChangeCustomDate('end', e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none text-xs"
          />
          <button
            onClick={onApplyCustom}
            className="px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950 font-semibold hover:bg-sky-400 transition-colors ml-auto"
          >
            Apply
          </button>
        </div>
      )}

      {/* Search & Category quick filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activities or apps..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500/50"
        >
          <option value="all">All Categories</option>
          <option value="coding">⌨️ Coding</option>
          <option value="music">🎵 Music</option>
          <option value="work">💼 Work</option>
          <option value="study">📚 Learning</option>
          <option value="other">◈ Other</option>
        </select>
      </div>
    </div>
  );
}
