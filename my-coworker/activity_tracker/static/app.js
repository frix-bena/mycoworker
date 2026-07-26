/* Activity Tracker Dashboard – app.js */

const CODING = '#38bdf8', MUSIC = '#a78bfa', OTHER = '#34d399';
let donutChart = null, timelineChart = null, dailyChart = null;

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(s) {
  if (!s) return '0m';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sc = Math.floor(s % 60);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sc}s`;
  return `${sc}s`;
}

function appIcon(name) {
  const n = (name || '').toLowerCase();
  if (/code|vscode|pycharm|vim|nvim|terminal|bash|git/.test(n)) return '⌨️';
  if (/spotify|vlc|music|youtube|discord|tidal/.test(n))       return '🎵';
  if (/chrome|firefox|brave|safari|opera/.test(n))             return '🌐';
  if (/slack|teams|zoom|skype|telegram/.test(n))               return '💬';
  return '📦';
}

function badge(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('cod')) return '<span class="badge bc">⌨ Coding</span>';
  if (c.includes('mus')) return '<span class="badge bm">♪ Music</span>';
  return '<span class="badge bo">◈ Other</span>';
}

function barColor(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('cod')) return CODING;
  if (c.includes('mus')) return MUSIC;
  return OTHER;
}

function pct(val, total) { return total ? Math.round(val / total * 100) : 0; }

// ── Date helpers ───────────────────────────────────────────────────────────
function toISO(d) { return d.toISOString().slice(0, 10); }

function dateRange(period) {
  const end = new Date();
  let start = new Date();
  if (period === '7days')  start.setDate(end.getDate() - 6);
  if (period === '30days') start.setDate(end.getDate() - 29);
  return { start: toISO(start), end: toISO(end) };
}

// ── State ──────────────────────────────────────────────────────────────────
const state = { period: 'today', start: toISO(new Date()), end: toISO(new Date()) };

// ── Chart.js defaults ──────────────────────────────────────────────────────
Chart.defaults.color = '#64748b';
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.borderColor = '#1e2d45';

const chartBase = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: true, labels: { color: '#e2e8f0', font: { size: 12 }, boxWidth: 10, padding: 16 } }, tooltip: { backgroundColor: '#111b2e', borderColor: '#1e2d45', borderWidth: 1 } },
};

// ── Fetch & render ─────────────────────────────────────────────────────────
async function loadData() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('content').style.display = 'none';

  try {
    const r = await fetch(`/api/data?start=${state.start}&end=${state.end}`);
    const d = await r.json();
    render(d);
  } catch (e) {
    document.getElementById('loading').innerHTML =
      '<div class="loading-txt">⚠ Could not load data. Is the server running?</div>';
    return;
  }

  document.getElementById('loading').style.display = 'none';
  document.getElementById('content').style.display = 'block';
}

function render(d) {
  const s = d.summary;

  // Hero
  document.getElementById('heroTotal').textContent = d.totalStr;
  document.getElementById('heroAvg').textContent   = d.avgStr;
  document.getElementById('heroSub').textContent   =
    `${d.start}  →  ${d.end}  ·  ${d.days} day${d.days !== 1 ? 's' : ''}`;
  document.getElementById('dateRangeTxt').textContent = `${d.start} → ${d.end}`;

  // Metrics
  document.getElementById('mCoding').textContent = fmt(s.coding);
  document.getElementById('mMusic').textContent  = fmt(s.music);
  document.getElementById('mOther').textContent  = fmt(s.other);
  document.getElementById('mTotal').textContent  = fmt(s.total);
  document.getElementById('pCoding').textContent = s.total ? pct(s.coding, s.total) + '% of total' : '';
  document.getElementById('pMusic').textContent  = s.total ? pct(s.music,  s.total) + '% of total' : '';
  document.getElementById('pOther').textContent  = s.total ? pct(s.other,  s.total) + '% of total' : '';
  document.getElementById('pTotal').textContent  = `${d.days} day${d.days !== 1 ? 's' : ''} tracked`;

  renderDonut(s);
  renderTimeline(d.timeline);

  const daily = document.getElementById('dailySection');
  if (d.days > 1 && d.daily && d.daily.length) {
    daily.style.display = 'block';
    renderDaily(d.daily);
  } else {
    daily.style.display = 'none';
  }

  renderApps(d.apps);

  const wkSec = document.getElementById('weeklySec');
  if (d.days >= 6 && d.weekly && d.weekly.length) {
    wkSec.style.display = 'block';
    renderWeekly(d.weekly);
  } else {
    wkSec.style.display = 'none';
  }

  document.getElementById('footerRange').textContent  = `${d.start} → ${d.end}`;
  document.getElementById('footerEvents').textContent = `${(d.timeline || []).reduce((a,t)=>a+t.coding+t.music+t.other,0)} events`;
}

// ── Donut ──────────────────────────────────────────────────────────────────
function renderDonut(s) {
  const ctx = document.getElementById('donutChart').getContext('2d');
  const data = { labels: ['Coding','Music','Other'], datasets: [{ data: [s.coding, s.music, s.other], backgroundColor: [CODING, MUSIC, OTHER], borderColor: '#070b12', borderWidth: 4, hoverOffset: 6 }] };
  if (donutChart) { donutChart.data = data; donutChart.update(); return; }
  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data,
    options: {
      ...chartBase,
      cutout: '62%',
      plugins: {
        ...chartBase.plugins,
        legend: { ...chartBase.plugins.legend, position: 'bottom' },
      },
    },
  });
}

// ── Timeline ───────────────────────────────────────────────────────────────
function renderTimeline(tl) {
  const ctx = document.getElementById('timelineChart').getContext('2d');
  if (!tl || !tl.length) { ctx.canvas.parentNode.innerHTML = '<div class="empty">No timeline data</div>'; return; }
  const labels = tl.map(t => t.hour.slice(11) || t.hour.slice(5,10));
  const data = {
    labels,
    datasets: [
      { label:'Coding', data: tl.map(t=>t.coding), backgroundColor: CODING+'cc', borderWidth:0, stack:'s' },
      { label:'Music',  data: tl.map(t=>t.music),  backgroundColor: MUSIC+'cc',  borderWidth:0, stack:'s' },
      { label:'Other',  data: tl.map(t=>t.other),  backgroundColor: OTHER+'cc',  borderWidth:0, stack:'s' },
    ],
  };
  const opts = {
    ...chartBase,
    scales: {
      x: { stacked:true, grid:{display:false}, ticks:{color:'#64748b',maxTicksLimit:8,font:{size:11}} },
      y: { stacked:true, grid:{color:'#1a2540'}, ticks:{color:'#64748b',font:{size:11}} },
    },
    plugins: { ...chartBase.plugins, legend:{...chartBase.plugins.legend,position:'top'} },
  };
  if (timelineChart) { timelineChart.data = data; timelineChart.update(); return; }
  timelineChart = new Chart(ctx, { type:'bar', data, options:opts });
}

// ── Daily bar ──────────────────────────────────────────────────────────────
function renderDaily(daily) {
  const ctx = document.getElementById('dailyChart').getContext('2d');
  const labels = daily.map(d=>d.date);
  const toHrs  = arr => arr.map(d=>+(d/3600).toFixed(2));
  const data = {
    labels,
    datasets: [
      { label:'Coding', data: toHrs(daily.map(d=>d.coding)), backgroundColor: CODING+'cc', borderWidth:0, stack:'s' },
      { label:'Music',  data: toHrs(daily.map(d=>d.music)),  backgroundColor: MUSIC+'cc',  borderWidth:0, stack:'s' },
      { label:'Other',  data: toHrs(daily.map(d=>d.other)),  backgroundColor: OTHER+'cc',  borderWidth:0, stack:'s' },
    ],
  };
  const opts = {
    ...chartBase,
    scales: {
      x: { stacked:true, grid:{display:false}, ticks:{color:'#64748b',maxRotation:45,font:{size:11}} },
      y: { stacked:true, grid:{color:'#1a2540'}, ticks:{color:'#64748b',font:{size:11}}, title:{display:true,text:'Hours',color:'#64748b',font:{size:11}} },
    },
    plugins: { ...chartBase.plugins, legend:{...chartBase.plugins.legend,position:'top'} },
  };
  if (dailyChart) { dailyChart.data = data; dailyChart.update(); return; }
  dailyChart = new Chart(ctx, { type:'bar', data, options:opts });
}

// ── Apps table ─────────────────────────────────────────────────────────────
function renderApps(apps) {
  const el = document.getElementById('appsBody');
  if (!apps || !apps.length) { el.innerHTML = '<tr><td colspan="4" class="empty">No app data</td></tr>'; return; }
  const maxT = apps[0].time || 1;
  el.innerHTML = apps.map((a,i) => {
    const p = Math.round(a.time / maxT * 100);
    const clr = barColor(a.category);
    const crown = i === 0 ? '👑 ' : '';
    return `<tr>
      <td><span class="aname">${crown}${appIcon(a.name)} ${a.name}</span></td>
      <td>${badge(a.category)}</td>
      <td class="mono">${a.timeStr}</td>
      <td><div class="bar-wrap"><div class="bar-fill" style="width:${p}%;background:${clr};box-shadow:0 0 6px ${clr}88"></div></div></td>
    </tr>`;
  }).join('');
}

// ── Weekly table ───────────────────────────────────────────────────────────
function renderWeekly(wk) {
  const el = document.getElementById('weeklyBody');
  el.innerHTML = wk.map(r => `<tr>
    <td>${r.date}</td>
    <td class="mono" style="color:${CODING}">${r.codingStr}</td>
    <td class="mono" style="color:${MUSIC}">${r.musicStr}</td>
    <td class="mono" style="color:${OTHER}">${r.otherStr}</td>
    <td class="mono">${r.totalStr}</td>
  </tr>`).join('');
}

// ── Period buttons ─────────────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const p = btn.dataset.period;
    state.period = p;
    const cr = document.getElementById('customRange');
    if (p === 'custom') { cr.style.display = 'flex'; return; }
    cr.style.display = 'none';
    const { start, end } = dateRange(p);
    state.start = start; state.end = end;
    loadData();
  });
});

document.getElementById('applyBtn').addEventListener('click', () => {
  state.start = document.getElementById('startDate').value;
  state.end   = document.getElementById('endDate').value;
  if (state.start && state.end) loadData();
});

// ── Init ───────────────────────────────────────────────────────────────────
const today = toISO(new Date());
document.getElementById('startDate').value = today;
document.getElementById('endDate').value   = today;
state.start = today; state.end = today;
loadData();
