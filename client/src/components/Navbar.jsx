import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  PlusCircle, 
  Timer, 
  RotateCcw, 
  Activity, 
  CheckCircle2,
  Trash2,
  Sparkles
} from 'lucide-react';
import AppIcon from './AppIcon';

export default function Navbar({ 
  onOpenAddModal, 
  onToggleTimer, 
  isTimerActive,
  timerSeconds,
  onSeedData, 
  onClearData,
  isSeeding,
  trackerStatus 
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isTracking = trackerStatus?.isTracking ?? true;
  const isIdle = trackerStatus?.isIdle ?? false;
  const currentApp = trackerStatus?.currentActivity?.appName;

  return (
    <header className="sticky top-0 z-30 bg-[#070b12]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand & Live status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                Activity Tracker
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  v2.0 Live
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  !isTracking ? 'bg-slate-500' : isIdle ? 'bg-amber-400' : 'bg-emerald-400 live-indicator'
                }`}></span>
                <span className={`flex items-center gap-1.5 ${
                  !isTracking ? 'text-slate-400' : isIdle ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'
                }`}>
                  {isTracking && !isIdle && currentApp && (
                    <AppIcon appName={currentApp} size="xs" />
                  )}
                  <span>
                    {!isTracking 
                      ? 'Tracker Paused' 
                      : isIdle 
                      ? 'Machine Idle' 
                      : currentApp 
                      ? `Live: ${currentApp}` 
                      : 'Active (No App Focused)'}
                  </span>
                </span>
              </span>
              <span>•</span>
              <span className="font-mono text-slate-400">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Timer Quick Button */}
          <button
            onClick={onToggleTimer}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isTimerActive
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200'
            }`}
            title="Toggle live activity stopwatch"
          >
            <Timer className={`w-4 h-4 ${isTimerActive ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{isTimerActive ? 'Active Timer' : 'Start Timer'}</span>
            {isTimerActive && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[11px] font-mono">
                {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s
              </span>
            )}
          </button>

          {/* Add Activity Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Activity</span>
          </button>

          {/* Seed Demo Data Button */}
          <button
            onClick={onSeedData}
            disabled={isSeeding}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/60 text-slate-300 hover:text-slate-100 transition-colors disabled:opacity-50"
            title="Generate realistic sample tracking data"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Demo Data</span>
          </button>

          {/* Clear Data Button */}
          <button
            onClick={onClearData}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
            title="Clear all activity logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
