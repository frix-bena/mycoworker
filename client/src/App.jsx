import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import DateRangeFilter from './components/DateRangeFilter';
import StatCards from './components/StatCards';
import LiveMachineTracker from './components/LiveMachineTracker';
import LiveTimer from './components/LiveTimer';
import ChartsSection from './components/ChartsSection';
import TopAppsTable from './components/TopAppsTable';
import ActivityList from './components/ActivityList';
import ActivityFormModal from './components/ActivityFormModal';
import { 
  fetchActivities, 
  fetchSummaryStats, 
  createActivity, 
  updateActivity, 
  deleteActivity, 
  seedSampleData, 
  clearAllActivities,
  fetchTrackerStatus,
  toggleMachineTracker,
  pollTrackerNow
} from './services/api';

export default function App() {
  // Data state
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Machine Tracker state
  const [trackerStatus, setTrackerStatus] = useState(null);
  const [isPollingTracker, setIsPollingTracker] = useState(false);

  // Filter state
  const [activePeriod, setActivePeriod] = useState('7days');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Live Timer state
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  // Modal & Toast state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper to compute date range strings based on selected period
  const getDateRange = useCallback(() => {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);

    if (activePeriod === 'today') {
      return { start: end, end };
    }
    if (activePeriod === 'yesterday') {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      const yStr = yest.toISOString().slice(0, 10);
      return { start: yStr, end: yStr };
    }
    if (activePeriod === '7days') {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return { start: start.toISOString().slice(0, 10), end };
    }
    if (activePeriod === '30days') {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return { start: start.toISOString().slice(0, 10), end };
    }
    if (activePeriod === 'custom') {
      return { start: customStart, end: customEnd };
    }
    // all
    return {};
  }, [activePeriod, customStart, customEnd]);

  // Load activities and summary
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const range = getDateRange();
      const [actsRes, sumRes] = await Promise.all([
        fetchActivities({
          start: range.start,
          end: range.end,
          category: categoryFilter,
          search: searchQuery
        }),
        fetchSummaryStats({
          start: range.start,
          end: range.end
        })
      ]);

      setActivities(actsRes.data || []);
      setSummary(sumRes.data || null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showToast('Failed to load activity data. Is the backend server running?', 'error');
    } finally {
      setLoading(false);
    }
  }, [getDateRange, categoryFilter, searchQuery]);

  // Initial load and reload when filters change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Machine Tracker Polling (every 3 seconds)
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetchTrackerStatus();
        if (isMounted && res?.data) {
          setTrackerStatus(res.data);
        }
      } catch (err) {
        // Silently handle background poll error
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Periodic subtle refresh of activities/summary as machine tracking accumulates
  useEffect(() => {
    const autoRefresh = () => {
      if (trackerStatus?.isTracking && !trackerStatus?.isIdle) {
        loadDashboardData();
      }
    };
    const interval = setInterval(autoRefresh, 8000);
    return () => clearInterval(interval);
  }, [trackerStatus?.isTracking, trackerStatus?.isIdle, loadDashboardData]);

  // Handlers for Machine Tracker
  const handleToggleTracker = async () => {
    try {
      const res = await toggleMachineTracker();
      setTrackerStatus(res.status);
      showToast(res.isTracking ? 'Machine tracking active' : 'Machine tracking paused', 'info');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to toggle machine tracker', 'error');
    }
  };

  const handlePollTrackerNow = async () => {
    setIsPollingTracker(true);
    try {
      const res = await pollTrackerNow();
      if (res?.data) {
        setTrackerStatus(res.data);
        showToast(`Synced: ${res.data.currentActivity?.appName || 'Machine activity'}`, 'success');
      }
      loadDashboardData();
    } catch (err) {
      showToast('Failed to probe machine activity', 'error');
    } finally {
      setIsPollingTracker(false);
    }
  };

  // Live Timer tick
  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive]);

  // Handlers for Live Timer
  const handleStartTimer = () => setIsTimerActive(true);
  const handlePauseTimer = () => setIsTimerActive(false);
  const handleResetTimer = () => {
    setIsTimerActive(false);
    setTimerSeconds(0);
  };

  const handleSaveTimerActivity = async (activityData) => {
    try {
      await createActivity(activityData);
      showToast(`Recorded "${activityData.title}" (${Math.floor(activityData.duration / 60)}m)`, 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to save live timer activity', 'error');
      throw err;
    }
  };

  // Handlers for manual activity creation & edit
  const handleOpenAddModal = () => {
    setEditingActivity(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (activity) => {
    setEditingActivity(activity);
    setIsAddModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editingActivity) {
        await updateActivity(editingActivity.id, formData);
        showToast('Activity updated successfully', 'success');
      } else {
        await createActivity(formData);
        showToast('New activity logged successfully', 'success');
      }
      loadDashboardData();
    } catch (err) {
      showToast('Failed to save activity', 'error');
      throw err;
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await deleteActivity(id);
      showToast('Activity deleted', 'info');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to delete activity', 'error');
    }
  };

  const handleSeedData = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      const res = await seedSampleData();
      showToast(`Seeded ${res.count || 'sample'} activities across the last 7 days!`, 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to seed sample data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all activities? This cannot be undone.')) {
      try {
        await clearAllActivities();
        showToast('All activities cleared', 'info');
        loadDashboardData();
      } catch (err) {
        showToast('Failed to clear activities', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navigation */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onToggleTimer={() => setIsTimerOpen(prev => !prev)}
        isTimerActive={isTimerActive}
        timerSeconds={timerSeconds}
        onSeedData={handleSeedData}
        onClearData={handleClearData}
        isSeeding={isSeeding}
        trackerStatus={trackerStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Live Machine Activity Tracker Banner */}
        <LiveMachineTracker
          trackerStatus={trackerStatus}
          onToggleTracker={handleToggleTracker}
          onPollNow={handlePollTrackerNow}
          isPolling={isPollingTracker}
        />

        {/* Date Filter & Search Controls */}
        <DateRangeFilter
          activePeriod={activePeriod}
          onSelectPeriod={(p) => setActivePeriod(p)}
          customStart={customStart}
          customEnd={customEnd}
          onChangeCustomDate={(type, val) => {
            if (type === 'start') setCustomStart(val);
            if (type === 'end') setCustomEnd(val);
          }}
          onApplyCustom={loadDashboardData}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
        />

        {/* Live Stopwatch widget */}
        <LiveTimer
          isOpen={isTimerOpen}
          onClose={() => setIsTimerOpen(false)}
          timerSeconds={timerSeconds}
          isTimerActive={isTimerActive}
          onStartTimer={handleStartTimer}
          onPauseTimer={handlePauseTimer}
          onResetTimer={handleResetTimer}
          onSaveTimerActivity={handleSaveTimerActivity}
        />

        {/* Metric Cards */}
        <StatCards summary={summary} />

        {/* Visualizations Section */}
        <ChartsSection summary={summary} />

        {/* Bottom Split: Top Applications & Activity Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Top Apps (4 cols) */}
          <div className="lg:col-span-5">
            <TopAppsTable topApps={summary?.topApps || []} />
          </div>

          {/* Activity Log Table (7 cols) */}
          <div className="lg:col-span-7">
            <ActivityList
              activities={activities}
              loading={loading}
              onDeleteActivity={handleDeleteActivity}
              onEditActivity={handleOpenEditModal}
              selectedCategory={categoryFilter}
              onSelectCategory={setCategoryFilter}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Activity Tracker • React + Vite + Express</span>
          </div>
          <div>
            <span>Local SQLite/JSON storage • Fully Offline & Private</span>
          </div>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <ActivityFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingActivity={editingActivity}
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md border animate-bounce ${
          toast.type === 'error'
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            : toast.type === 'success'
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
        }`}>
          <span>{toast.type === 'error' ? '⚠️' : '⚡'}</span>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
