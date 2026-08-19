import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Pause, 
  Play, 
  RotateCw, 
  Code2, 
  Music, 
  Globe, 
  Laptop, 
  Clock, 
  Radio, 
  Sparkles,
  Volume2,
  Moon,
  CheckCircle,
  Zap
} from 'lucide-react';
import { formatDuration } from '../utils/formatters';

export default function LiveMachineTracker({ 
  trackerStatus, 
  onToggleTracker, 
  onPollNow,
  isPolling 
}) {
  const [seconds, setSeconds] = useState(0);

  const isTracking = trackerStatus?.isTracking ?? true;
  const currentAct = trackerStatus?.currentActivity;
  const media = trackerStatus?.media;
  const isIdle = trackerStatus?.isIdle ?? false;
  const idleSecs = trackerStatus?.idleSeconds ?? 0;
  const platform = trackerStatus?.platform || 'linux';

  // Local ticker for live active duration
  useEffect(() => {
    if (currentAct?.startTime && isTracking && !isIdle) {
      const calcSecs = () => {
        const start = new Date(currentAct.startTime).getTime();
        const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
        setSeconds(diff);
      };
      calcSecs();
      const interval = setInterval(calcSecs, 1000);
      return () => clearInterval(interval);
    } else {
      setSeconds(currentAct?.duration || 0);
    }
  }, [currentAct?.startTime, currentAct?.duration, isTracking, isIdle]);

  const getCategoryConfig = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'coding':
        return {
          icon: Code2,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          badgeBg: 'bg-cyan-500/20 text-cyan-300',
          label: 'Coding & Development'
        };
      case 'music':
        return {
          icon: Music,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          badgeBg: 'bg-purple-500/20 text-purple-300',
          label: 'Music & Audio'
        };
      case 'work':
      case 'study':
        return {
          icon: Globe,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          badgeBg: 'bg-emerald-500/20 text-emerald-300',
          label: 'Work & Research'
        };
      default:
        return {
          icon: Laptop,
          color: 'text-slate-400',
          bg: 'bg-slate-800/40',
          border: 'border-slate-700/50',
          badgeBg: 'bg-slate-700/50 text-slate-300',
          label: 'General Workspace'
        };
    }
  };

  const catConfig = getCategoryConfig(currentAct?.category || 'other');
  const CatIcon = catConfig.icon;

  const formatHMS = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/95 via-[#0c1427]/95 to-slate-900/95 border border-cyan-500/20 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-64 h-24 bg-cyan-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />
      <div className="absolute bottom-0 left-1/3 w-72 h-20 bg-indigo-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left column: Live indicator, App details, current task */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          
          {/* Animated App / Category Icon */}
          <div className={`relative p-3.5 rounded-2xl ${catConfig.bg} border ${catConfig.border} flex-shrink-0 shadow-md`}>
            <CatIcon className={`w-6 h-6 ${catConfig.color}`} />
            {isTracking && !isIdle && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Header badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-slate-800/90 border border-slate-700/80">
                {isTracking ? (
                  isIdle ? (
                    <>
                      <Moon className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-300">Machine Idle</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-300">Live Machine Tracking</span>
                    </>
                  )
                ) : (
                  <>
                    <Pause className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-400">Tracking Paused</span>
                  </>
                )}
              </div>

              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${catConfig.badgeBg}`}>
                {catConfig.label}
              </span>

              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Host: <span className="text-slate-300 uppercase">{platform}</span>
              </span>
            </div>

            {/* Application Name & Active Window Title */}
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate tracking-tight">
                {currentAct ? currentAct.appName : 'Analyzing machine activity...'}
              </h2>
            </div>
            
            <p className="text-xs text-slate-400 truncate max-w-2xl font-normal mt-0.5">
              {currentAct?.title || 'Tracking active window and background tasks in real-time'}
            </p>

            {/* Rich notes / Media banner */}
            {media && media.isPlaying && (
              <div className="flex items-center gap-2 mt-2 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 max-w-xl text-[11px] text-purple-200">
                <Volume2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 animate-bounce" />
                <span className="font-semibold text-purple-300">{media.player}:</span>
                <span className="truncate">{media.artist ? `${media.artist} — ` : ''}{media.title}</span>
              </div>
            )}
          </div>

        </div>

        {/* Right column: Real-time duration timer & Action buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
          
          {/* Ongoing Session Duration */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 flex flex-col items-start min-w-[120px]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Current Session</span>
            </div>
            <div className="text-lg font-bold font-mono text-cyan-300 tracking-wider">
              {formatHMS(seconds)}
            </div>
          </div>

          {/* Idle status badge */}
          <div className="hidden sm:flex flex-col items-start px-2 text-[11px] text-slate-400">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">User Status</span>
            <span className={isIdle ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
              {isIdle ? `Idle (${idleSecs}s)` : `Active (${idleSecs}s ago)`}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            
            {/* Toggle Start/Stop tracking */}
            <button
              onClick={onToggleTracker}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isTracking
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200 hover:text-white'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/40 text-emerald-300'
              }`}
              title={isTracking ? 'Pause automatic machine tracking' : 'Resume automatic machine tracking'}
            >
              {isTracking ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Resume</span>
                </>
              )}
            </button>

            {/* Immediate Force Probe */}
            <button
              onClick={onPollNow}
              disabled={isPolling}
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              title="Force immediate activity probe & sync"
            >
              <RotateCw className={`w-4 h-4 ${isPolling ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
