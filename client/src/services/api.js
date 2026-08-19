const API_BASE = '/api';

export async function fetchActivities(filters = {}) {
  const params = new URLSearchParams();
  if (filters.start) params.append('start', filters.start);
  if (filters.end) params.append('end', filters.end);
  if (filters.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit);

  const res = await fetch(`${API_BASE}/activities?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function fetchSummaryStats(filters = {}) {
  const params = new URLSearchParams();
  if (filters.start) params.append('start', filters.start);
  if (filters.end) params.append('end', filters.end);

  const res = await fetch(`${API_BASE}/stats/summary?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function createActivity(activityData) {
  const res = await fetch(`${API_BASE}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activityData)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function updateActivity(id, activityData) {
  const res = await fetch(`${API_BASE}/activities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activityData)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function deleteActivity(id) {
  const res = await fetch(`${API_BASE}/activities/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function seedSampleData() {
  const res = await fetch(`${API_BASE}/activities/seed`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function clearAllActivities() {
  const res = await fetch(`${API_BASE}/activities/clear/all`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function fetchTrackerStatus() {
  const res = await fetch(`${API_BASE}/tracker/status`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function toggleMachineTracker() {
  const res = await fetch(`${API_BASE}/tracker/toggle`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function startMachineTracker() {
  const res = await fetch(`${API_BASE}/tracker/start`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function stopMachineTracker() {
  const res = await fetch(`${API_BASE}/tracker/stop`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function pollTrackerNow() {
  const res = await fetch(`${API_BASE}/tracker/poll-now`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

