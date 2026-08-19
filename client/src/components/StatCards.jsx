import React from 'react';
import { 
  Code2, 
  Headphones, 
  Briefcase, 
  Clock, 
  Flame, 
  Layers 
} from 'lucide-react';
import { formatDuration } from '../utils/formatters';

export default function StatCards({ summary }) {
  if (!summary) return null;

  const totalSecs = summary.totalDuration || 0;
  const codingSecs = summary.categoryTotals?.coding || 0;
  const musicSecs = summary.categoryTotals?.music || 0;
  const workSecs = (summary.categoryTotals?.work || 0) + (summary.categoryTotals?.study || 0);
  const otherSecs = summary.categoryTotals?.other || 0;

  const getPct = (val) => (totalSecs > 0 ? Math.round((val / totalSecs) * 100) : 0);

  const cards = [
    {
      title: 'Total Active Time',
      value: formatDuration(totalSecs),
      subtext: `${summary.daysCount || 1} day${summary.daysCount !== 1 ? 's' : ''} tracked`,
      icon: Clock,
      color: 'from-blue-500/20 to-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      glow: 'glow-cyan'
    },
    {
      title: 'Coding Time',
      value: formatDuration(codingSecs),
      badge: `${getPct(codingSecs)}%`,
      subtext: `${summary.categoryCounts?.coding || 0} coding sessions`,
      icon: Code2,
      color: 'from-sky-500/20 to-blue-600/10',
      borderColor: 'border-sky-500/30',
      iconColor: 'text-sky-400'
    },
    {
      title: 'Music & Media',
      value: formatDuration(musicSecs),
      badge: `${getPct(musicSecs)}%`,
      subtext: `${summary.categoryCounts?.music || 0} media sessions`,
      icon: Headphones,
      color: 'from-purple-500/20 to-violet-600/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      glow: 'glow-purple'
    },
    {
      title: 'Work & Research',
      value: formatDuration(workSecs),
      badge: `${getPct(workSecs)}%`,
      subtext: `${(summary.categoryCounts?.work || 0) + (summary.categoryCounts?.study || 0)} sessions`,
      icon: Briefcase,
      color: 'from-emerald-500/20 to-teal-600/10',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      glow: 'glow-emerald'
    },
    {
      title: 'Daily Average',
      value: formatDuration(summary.averageDailyDuration || 0),
      subtext: 'active / day',
      icon: Flame,
      color: 'from-amber-500/20 to-orange-600/10',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${card.color} bg-[#0b1120] border ${card.borderColor} p-4 transition-all duration-200 hover:scale-[1.02] shadow-sm`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-slate-400 truncate">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg bg-slate-900/80 ${card.iconColor}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
                {card.value}
              </span>
              {card.badge && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300">
                  {card.badge}
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-400 truncate">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
