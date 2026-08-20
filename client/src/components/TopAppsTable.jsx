import React from 'react';
import { Monitor, Layers } from 'lucide-react';
import { formatDuration, getCategoryInfo } from '../utils/formatters';
import AppIcon from './AppIcon';

export default function TopAppsTable({ topApps }) {
  if (!topApps || topApps.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Top Applications
          </h3>
        </div>
        <p className="text-xs text-slate-500 py-4 text-center">No application usage recorded for this period.</p>
      </div>
    );
  }

  const maxDuration = topApps[0]?.duration || 1;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Top Applications & Tools
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">Ranked by active duration</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium">
              <th className="pb-2 pl-2">#</th>
              <th className="pb-2">Application</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Sessions</th>
              <th className="pb-2">Active Time</th>
              <th className="pb-2 pr-2 w-36">Distribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {topApps.map((app, idx) => {
              const cat = getCategoryInfo(app.category);
              const barPercent = Math.min(100, Math.round((app.duration / maxDuration) * 100));
              const isFirst = idx === 0;

              return (
                <tr key={app.name} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-2.5 pl-2 font-mono text-slate-500 font-semibold">
                    {isFirst ? '👑' : `#${idx + 1}`}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2.5 font-medium text-slate-200">
                      <AppIcon appName={app.name} category={app.category} size="sm" />
                      <span className="truncate">{app.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${cat.badgeClass}`}>
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">
                    {app.count}
                  </td>
                  <td className="py-2.5 font-mono font-semibold text-slate-200">
                    {formatDuration(app.duration)}
                  </td>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${barPercent}%`,
                            backgroundColor: cat.color
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
                        {app.percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
