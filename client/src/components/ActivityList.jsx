import React, { useState } from 'react';
import { 
  ListOrdered, 
  Trash2, 
  Edit3, 
  Clock, 
  Calendar, 
  MessageSquare,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { 
  formatDuration, 
  formatDate, 
  formatTime, 
  getCategoryInfo, 
  getAppIconEmoji 
} from '../utils/formatters';

export default function ActivityList({
  activities,
  loading,
  onDeleteActivity,
  onEditActivity,
  selectedCategory,
  onSelectCategory
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const categories = [
    { id: 'all', label: 'All Activities' },
    { id: 'coding', label: '⌨️ Coding' },
    { id: 'music', label: '🎵 Music' },
    { id: 'work', label: '💼 Work' },
    { id: 'study', label: '📚 Learning' },
    { id: 'other', label: '◈ Other' }
  ];

  const handleDelete = async (id) => {
    await onDeleteActivity(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
      
      {/* Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Activity Log ({activities.length})
          </h3>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-700 text-slate-100 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          Loading activity logs...
        </div>
      ) : activities.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs space-y-2">
          <p>No activity logs found for the selected criteria.</p>
          <p className="text-[11px] text-slate-600">Try logging an activity or clicking "Demo Data" above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2.5 pl-2">Activity / Window</th>
                <th className="pb-2.5">Application</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Date & Time</th>
                <th className="pb-2.5">Duration</th>
                <th className="pb-2.5">Notes</th>
                <th className="pb-2.5 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {activities.map((act) => {
                const cat = getCategoryInfo(act.category);
                const isConfirming = deleteConfirmId === act.id;

                return (
                  <tr key={act.id} className="hover:bg-slate-800/40 transition-colors group">
                    
                    {/* Activity title */}
                    <td className="py-3 pl-2">
                      <div className="font-semibold text-slate-200 max-w-xs truncate">
                        {act.title}
                      </div>
                    </td>

                    {/* App name with icon */}
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-300">
                        <span>{getAppIconEmoji(act.appName)}</span>
                        <span>{act.appName}</span>
                      </div>
                    </td>

                    {/* Category badge */}
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${cat.badgeClass}`}>
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </td>

                    {/* Date & time */}
                    <td className="py-3 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span>{formatDate(act.startTime)}</span>
                        <span className="text-slate-600">·</span>
                        <span>{formatTime(act.startTime)}</span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3 font-mono font-bold text-sky-400 whitespace-nowrap">
                      {formatDuration(act.duration)}
                    </td>

                    {/* Notes */}
                    <td className="py-3 text-slate-400 max-w-[200px] truncate text-[11px]">
                      {act.notes || <span className="text-slate-600 italic">—</span>}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-2 text-right whitespace-nowrap">
                      {isConfirming ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDelete(act.id)}
                            className="px-2 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold shadow-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditActivity(act)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
                            title="Edit activity"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(act.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete activity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
