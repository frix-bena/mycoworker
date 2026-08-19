import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { PieChart, BarChart3, TrendingUp } from 'lucide-react';
import { formatDuration } from '../utils/formatters';

// Register ChartJS plugins
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

export default function ChartsSection({ summary }) {
  if (!summary) return null;

  const { categoryTotals, hourlyTimeline, dailyTrend, totalDuration } = summary;

  // 1. Category Doughnut Chart Data
  const catKeys = ['coding', 'music', 'work', 'study', 'other'];
  const catLabels = ['Coding', 'Music / Media', 'Work / Docs', 'Learning', 'Other'];
  const catColors = ['#38bdf8', '#a78bfa', '#34d399', '#f59e0b', '#94a3b8'];
  const catValues = catKeys.map(k => (categoryTotals?.[k] || 0));

  const doughnutData = {
    labels: catLabels,
    datasets: [
      {
        data: catValues,
        backgroundColor: catColors,
        borderColor: '#070b12',
        borderWidth: 3,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter' },
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          padding: 14
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#1e293b',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        callbacks: {
          label: function (ctx) {
            const val = ctx.raw || 0;
            const pct = totalDuration > 0 ? Math.round((val / totalDuration) * 100) : 0;
            return ` ${ctx.label}: ${formatDuration(val)} (${pct}%)`;
          }
        }
      }
    }
  };

  // 2. Hourly Timeline Bar Chart Data
  const timelineLabels = (hourlyTimeline || []).map(h => h.hour);
  const timelineCoding = (hourlyTimeline || []).map(h => Math.round((h.coding || 0) / 60)); // in minutes
  const timelineMusic = (hourlyTimeline || []).map(h => Math.round((h.music || 0) / 60));
  const timelineWork = (hourlyTimeline || []).map(h => Math.round(((h.work || 0) + (h.study || 0)) / 60));
  const timelineOther = (hourlyTimeline || []).map(h => Math.round((h.other || 0) / 60));

  const timelineData = {
    labels: timelineLabels,
    datasets: [
      {
        label: 'Coding',
        data: timelineCoding,
        backgroundColor: '#38bdf8cc',
        stack: 'stack1',
        borderRadius: 2
      },
      {
        label: 'Music',
        data: timelineMusic,
        backgroundColor: '#a78bfacc',
        stack: 'stack1',
        borderRadius: 2
      },
      {
        label: 'Work/Docs',
        data: timelineWork,
        backgroundColor: '#34d399cc',
        stack: 'stack1',
        borderRadius: 2
      },
      {
        label: 'Other',
        data: timelineOther,
        backgroundColor: '#94a3b8aa',
        stack: 'stack1',
        borderRadius: 2
      }
    ]
  };

  const timelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 12 }
      },
      y: {
        stacked: true,
        grid: { color: '#1e293b' },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          callback: (v) => `${v}m`
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#1e293b',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} mins`
        }
      }
    }
  };

  // 3. Daily Trend Chart
  const showDaily = dailyTrend && dailyTrend.length > 1;
  const dailyLabels = (dailyTrend || []).map(d => d.displayDate || d.date);
  const dailyCodingHours = (dailyTrend || []).map(d => +((d.coding || 0) / 3600).toFixed(1));
  const dailyMusicHours = (dailyTrend || []).map(d => +((d.music || 0) / 3600).toFixed(1));
  const dailyWorkHours = (dailyTrend || []).map(d => +(((d.work || 0) + (d.study || 0)) / 3600).toFixed(1));
  const dailyOtherHours = (dailyTrend || []).map(d => +((d.other || 0) / 3600).toFixed(1));

  const dailyData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Coding (hrs)',
        data: dailyCodingHours,
        backgroundColor: '#38bdf8',
        stack: 'daily',
        borderRadius: 4
      },
      {
        label: 'Music (hrs)',
        data: dailyMusicHours,
        backgroundColor: '#a78bfa',
        stack: 'daily',
        borderRadius: 4
      },
      {
        label: 'Work (hrs)',
        data: dailyWorkHours,
        backgroundColor: '#34d399',
        stack: 'daily',
        borderRadius: 4
      },
      {
        label: 'Other (hrs)',
        data: dailyOtherHours,
        backgroundColor: '#94a3b8',
        stack: 'daily',
        borderRadius: 4
      }
    ]
  };

  const dailyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      y: {
        stacked: true,
        grid: { color: '#1e293b' },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          callback: (v) => `${v}h`
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          padding: 12
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 2-column Visualizations: Category distribution + Hourly timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Doughnut Chart */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Activity Breakdown
            </h3>
          </div>
          
          <div className="relative h-56 flex items-center justify-center">
            {totalDuration > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="text-center text-xs text-slate-500">
                No activity data in this period
              </div>
            )}
          </div>
        </div>

        {/* Hourly Timeline */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Hourly Activity Timeline (24 Hours)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Minutes per hour</span>
          </div>

          <div className="h-56">
            <Bar data={timelineData} options={timelineOptions} />
          </div>
        </div>

      </div>

      {/* Multi-day Daily Breakdown if multiple days selected */}
      {showDaily && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Daily Activity Trends
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Hours per day</span>
          </div>

          <div className="h-44">
            <Bar data={dailyData} options={dailyOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
