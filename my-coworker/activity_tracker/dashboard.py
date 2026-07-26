"""Streamlit dashboard for activity tracking visualization."""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
from database import ActivityDatabase
from config import MONITOR_INTERVAL
import logging

st.set_page_config(
    page_title="Activity Tracker",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── Palette ───────────────────────────────────────────────────────────────────
BG       = "#080c14"
SURF     = "#0e1421"
SURF2    = "#141c2e"
BORDER   = "#1e2d45"
TXT      = "#e2e8f0"
MUTED    = "#64748b"
C_CODE   = "#38bdf8"   # sky blue   – Coding
C_MUSIC  = "#a78bfa"   # violet     – Music
C_OTHER  = "#34d399"   # emerald    – Other
C_TOTAL  = "#f8fafc"

CHART_BASE = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(family="Inter, sans-serif", color=MUTED, size=12),
    margin=dict(l=4, r=4, t=40, b=4),
    legend=dict(
        bgcolor="rgba(0,0,0,0)",
        font=dict(color=TXT, size=12),
        orientation="h", yanchor="bottom", y=1.02, xanchor="left", x=0,
    ),
)

st.markdown("""
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
""", unsafe_allow_html=True)

st.markdown(f"""
<style>
/* ── base ── */
html,body,[class*="css"]{{font-family:'Inter',sans-serif;color:{TXT};}}
.stApp{{background:{BG};}}
section[data-testid="stSidebar"]{{background:{SURF};border-right:1px solid {BORDER};}}
#MainMenu,footer,header{{visibility:hidden;}}

/* ── sidebar controls ── */
section[data-testid="stSidebar"] .stRadio label{{
  background:{SURF2};border:1px solid {BORDER};border-radius:10px;
  padding:9px 14px;margin:3px 0;display:block;cursor:pointer;
  transition:all .18s;font-size:13px;color:{TXT}!important;
}}
section[data-testid="stSidebar"] .stRadio label:hover{{border-color:{C_CODE};background:#0d1829;}}
section[data-testid="stSidebar"] .stDateInput input{{
  background:{SURF2}!important;border:1px solid {BORDER}!important;
  color:{TXT}!important;border-radius:8px!important;font-size:13px!important;
}}

/* ── hero ── */
.hero{{
  background:linear-gradient(135deg,{SURF} 0%,#0a1628 60%,#0d1a36 100%);
  border:1px solid {BORDER};border-radius:20px;padding:36px 40px;
  margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;
  position:relative;overflow:hidden;
}}
.hero::before{{
  content:'';position:absolute;top:-60px;right:-60px;
  width:280px;height:280px;border-radius:50%;
  background:radial-gradient(circle,rgba(56,189,248,.08) 0%,transparent 70%);
  pointer-events:none;
}}
.hero-title{{
  font-size:30px;font-weight:700;margin:0 0 6px;
  background:linear-gradient(90deg,{TXT} 0%,{C_CODE} 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}}
.hero-sub{{color:{MUTED};font-size:13px;margin:0;}}
.hero-stat{{text-align:right;}}
.hero-num{{
  font-family:'JetBrains Mono',monospace;font-size:42px;font-weight:700;
  color:{C_CODE};line-height:1;text-shadow:0 0 32px rgba(56,189,248,.35);
}}
.hero-num-label{{font-size:11px;color:{MUTED};margin-top:5px;letter-spacing:.07em;text-transform:uppercase;}}

/* ── section title ── */
.sec{{
  font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
  color:{MUTED};margin:28px 0 12px;padding-bottom:8px;border-bottom:1px solid {BORDER};
}}

/* ── metric cards ── */
.cards{{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:4px;}}
.card{{
  background:{SURF};border:1px solid {BORDER};border-radius:16px;
  padding:22px 20px;position:relative;overflow:hidden;
  transition:transform .2s,box-shadow .2s;
}}
.card:hover{{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.5);}}
.card-glow{{position:absolute;top:0;left:0;right:0;height:2px;border-radius:16px 16px 0 0;}}
.card-icon{{font-size:18px;margin-bottom:10px;display:block;opacity:.85;}}
.card-label{{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:{MUTED};margin-bottom:6px;}}
.card-val{{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:600;line-height:1;}}

/* ── chart wrappers ── */
.chart-box{{
  background:{SURF};border:1px solid {BORDER};border-radius:16px;
  overflow:hidden;padding:4px 4px 0;
}}

/* ── apps table ── */
.atbl{{width:100%;border-collapse:collapse;font-size:13px;}}
.atbl th{{
  color:{MUTED};font-size:10px;font-weight:600;letter-spacing:.09em;
  text-transform:uppercase;padding:0 14px 10px;text-align:left;
  border-bottom:1px solid {BORDER};
}}
.atbl td{{padding:11px 14px;border-bottom:1px solid #131c2e;vertical-align:middle;}}
.atbl tr:first-child td{{background:rgba(56,189,248,.05);}}
.atbl tr:hover td{{background:{SURF2};}}
.aname{{font-weight:500;color:{TXT};}}
.bdg{{display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;}}
.bdg-c{{background:rgba(56,189,248,.12);color:{C_CODE};}}
.bdg-m{{background:rgba(167,139,250,.12);color:{C_MUSIC};}}
.bdg-o{{background:rgba(52,211,153,.12);color:{C_OTHER};}}
.bar-wrap{{background:{SURF2};border-radius:4px;height:5px;width:90px;overflow:hidden;}}
.bar-fill{{height:5px;border-radius:4px;}}
.mono{{font-family:'JetBrains Mono',monospace;font-size:12px;color:{MUTED};}}

/* ── weekly table ── */
.wtbl{{width:100%;border-collapse:collapse;font-size:13px;}}
.wtbl th{{
  color:{MUTED};font-size:10px;font-weight:600;letter-spacing:.09em;
  text-transform:uppercase;padding:0 14px 10px;text-align:left;
  border-bottom:1px solid {BORDER};
}}
.wtbl td{{padding:10px 14px;border-bottom:1px solid #131c2e;color:{TXT};}}
.wtbl tr:hover td{{background:{SURF2};}}

/* ── sidebar extras ── */
.sbox{{
  background:{SURF2};border:1px solid {BORDER};border-radius:12px;
  padding:14px 16px;margin-bottom:14px;
}}
.slabel{{font-size:10px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:{MUTED};margin-bottom:10px;}}
.dot{{
  display:inline-block;width:8px;height:8px;border-radius:50%;
  background:{C_OTHER};box-shadow:0 0 10px {C_OTHER};
  animation:pulse 2s ease-in-out infinite;margin-right:7px;
}}
@keyframes pulse{{0%,100%{{opacity:1;transform:scale(1);}}50%{{opacity:.5;transform:scale(1.4);}}}}
</style>
""", unsafe_allow_html=True)

logger = logging.getLogger(__name__)


@st.cache_resource
def get_database():
    return ActivityDatabase()


def fmt(s):
    if not s:
        return "0m"
    h, rem = divmod(int(s), 3600)
    m, sec = divmod(rem, 60)
    if h:   return f"{h}h {m}m"
    if m:   return f"{m}m {sec}s"
    return f"{sec}s"


def badge(cat):
    c = (cat or "").lower()
    if "cod" in c: return f'<span class="bdg bdg-c">⌨ Coding</span>'
    if "mus" in c: return f'<span class="bdg bdg-m">♪ Music</span>'
    return f'<span class="bdg bdg-o">◈ Other</span>'


def icon(name):
    n = (name or "").lower()
    if any(x in n for x in ["code","vscode","pycharm","vim","nvim","terminal","bash","git"]): return "⌨️"
    if any(x in n for x in ["spotify","vlc","music","youtube","discord","tidal"]): return "🎵"
    if any(x in n for x in ["chrome","firefox","brave","safari","opera"]): return "🌐"
    if any(x in n for x in ["slack","teams","zoom","skype","telegram"]): return "💬"
    return "📦"


def pie(data):
    if not data or all(v == 0 for v in data.values()):
        return None
    fig = go.Figure(go.Pie(
        labels=list(data.keys()), values=list(data.values()),
        hole=0.6,
        marker=dict(colors=[C_CODE, C_MUSIC, C_OTHER], line=dict(color=BG, width=4)),
        textfont=dict(family="Inter", size=13, color=TXT),
        hovertemplate="<b>%{label}</b><br>%{percent}<extra></extra>",
        pull=[0.04, 0, 0],
    ))
    fig.update_layout(**CHART_BASE, height=320, showlegend=True,
        annotations=[dict(text="<b>Activity</b>", x=.5, y=.5,
            font=dict(size=13, color=MUTED, family="Inter"), showarrow=False)])
    return fig


def timeline(activities):
    if not activities:
        return None
    df = pd.DataFrame([
        {"timestamp": pd.to_datetime(r[1]), "category": r[4]}
        for r in activities
    ])
    if df.empty: return None
    df["hour"] = df["timestamp"].dt.floor("H")
    h = df.groupby(["hour","category"]).size().reset_index(name="count")
    cmap = {"coding": C_CODE, "music": C_MUSIC, "other": C_OTHER}
    fig = px.bar(h, x="hour", y="count", color="category",
        color_discrete_map=cmap, height=320,
        labels={"hour": "", "count": "Events", "category": ""})
    fig.update_traces(marker_line_width=0, opacity=.9)
    fig.update_layout(**CHART_BASE, barmode="stack", hovermode="x unified",
        xaxis=dict(showgrid=False, zeroline=False, color=MUTED, tickfont=dict(size=11)),
        yaxis=dict(showgrid=True, gridcolor="#1a2540", zeroline=False, color=MUTED))
    return fig


def daily_bar(dd):
    if not dd or not dd.get("dates"): return None
    fig = go.Figure()
    for cat, clr, lbl in [("coding",C_CODE,"Coding"),("music",C_MUSIC,"Music"),("other",C_OTHER,"Other")]:
        vals = [v/3600 for v in dd.get(cat,[])]
        fig.add_trace(go.Bar(name=lbl, x=dd["dates"], y=vals,
            marker=dict(color=clr, line=dict(width=0)), opacity=.88,
            hovertemplate=f"<b>{lbl}</b>: %{{y:.2f}}h<extra></extra>"))
    fig.update_layout(**CHART_BASE, barmode="stack", height=340, hovermode="x unified",
        xaxis=dict(showgrid=False, zeroline=False, color=MUTED, tickangle=-30, tickfont=dict(size=11)),
        yaxis=dict(showgrid=True, gridcolor="#1a2540", zeroline=False, color=MUTED,
            title=dict(text="Hours", font=dict(size=11))))
    return fig


def card(kind, icon_str, label, val, clr):
    glow = f'background:{clr};box-shadow:0 0 16px {clr}44;'
    val_style = f'color:{clr};text-shadow:0 0 20px {clr}55;'
    st.markdown(f"""
    <div class="card">
        <div class="card-glow" style="{glow}"></div>
        <span class="card-icon">{icon_str}</span>
        <div class="card-label">{label}</div>
        <div class="card-val" style="{val_style}">{val}</div>
    </div>""", unsafe_allow_html=True)


def apps_table(top, max_s):
    rows = ""
    for i, r in enumerate(top):
        name = r[0] or "Unknown"
        cat  = (r[1] or "other").lower()
        s    = r[3] or 0
        pct  = int(s / max_s * 100) if max_s else 0
        clr  = C_CODE if "cod" in cat else (C_MUSIC if "mus" in cat else C_OTHER)
        crown = "👑 " if i == 0 else ""
        rows += f"""<tr>
            <td><span class="aname">{crown}{icon(name)} {name}</span></td>
            <td>{badge(cat)}</td>
            <td class="mono">{fmt(s)}</td>
            <td><div class="bar-wrap"><div class="bar-fill" style="width:{pct}%;background:{clr};box-shadow:0 0 6px {clr}88;"></div></div></td>
        </tr>"""
    st.markdown(f"""
    <table class="atbl"><thead><tr>
        <th>Application</th><th>Category</th><th>Time</th><th>Usage</th>
    </tr></thead><tbody>{rows}</tbody></table>""", unsafe_allow_html=True)


def main():
    db = get_database()

    # ── Sidebar ───────────────────────────────────────────────────────────────
    with st.sidebar:
        st.markdown(f"""
        <div style="display:flex;align-items:center;padding:4px 0 22px">
          <span style="font-size:24px;margin-right:10px">⚡</span>
          <div>
            <div style="font-size:15px;font-weight:700;color:{TXT}">Activity Tracker</div>
            <div style="font-size:11px;color:{MUTED}">Developer Dashboard</div>
          </div>
        </div>""", unsafe_allow_html=True)

        st.markdown(f'<div class="sbox"><div class="slabel">📅 Time Period</div>', unsafe_allow_html=True)
        period = st.radio("", ["Today","Last 7 Days","Last 30 Days","Custom"], label_visibility="collapsed")
        st.markdown('</div>', unsafe_allow_html=True)

        if period == "Custom":
            st.markdown(f'<div class="sbox"><div class="slabel">🗓 Custom Range</div>', unsafe_allow_html=True)
            start = st.date_input("Start", datetime.now()-timedelta(days=7))
            end   = st.date_input("End",   datetime.now())
            st.markdown('</div>', unsafe_allow_html=True)
        else:
            end = datetime.now().date()
            start = end if period=="Today" else (
                end-timedelta(days=6) if period=="Last 7 Days" else end-timedelta(days=29))

        st.markdown(f"""
        <div class="sbox" style="margin-top:16px">
          <div class="slabel">Status</div>
          <div style="display:flex;align-items:center;font-size:13px;font-weight:500;color:{C_OTHER}">
            <span class="dot"></span>Tracking active
          </div>
          <div style="font-size:11px;color:{MUTED};margin-top:6px">{start} → {end}</div>
        </div>""", unsafe_allow_html=True)

    # ── Fetch ─────────────────────────────────────────────────────────────────
    acts = db.get_activities(
        start_date=start.strftime("%Y-%m-%d"),
        end_date=end.strftime("%Y-%m-%d"))

    tot = {"coding":0,"music":0,"other":0}
    for a in acts:
        c = a[4]
        if c in tot:
            tot[c] += a[6] if a[6] else MONITOR_INTERVAL

    total_s  = sum(tot.values())
    days_n   = max((end-start).days+1, 1)
    avg_s    = total_s // days_n

    # ── Hero ──────────────────────────────────────────────────────────────────
    st.markdown(f"""
    <div class="hero">
      <div>
        <div class="hero-title">⚡ Activity Tracker</div>
        <div class="hero-sub">Your productivity at a glance &nbsp;·&nbsp; {start} → {end}</div>
      </div>
      <div class="hero-stat">
        <div class="hero-num">{fmt(total_s)}</div>
        <div class="hero-num-label">Total · avg {fmt(avg_s)} / day</div>
      </div>
    </div>""", unsafe_allow_html=True)

    # ── Metric cards ──────────────────────────────────────────────────────────
    st.markdown('<div class="sec">📈 Summary</div>', unsafe_allow_html=True)
    c1,c2,c3,c4 = st.columns(4)
    with c1: card("coding","⌨️","Coding Time",     fmt(tot["coding"]), C_CODE)
    with c2: card("music", "🎵","Music / Media",   fmt(tot["music"]),  C_MUSIC)
    with c3: card("other", "◈", "Other",           fmt(tot["other"]),  C_OTHER)
    with c4: card("total", "⚡","Total Active",    fmt(total_s),       C_TOTAL)

    # ── Charts row ────────────────────────────────────────────────────────────
    st.markdown('<div class="sec">📊 Visualizations</div>', unsafe_allow_html=True)
    l, r = st.columns(2)

    with l:
        st.markdown('<div class="chart-box">', unsafe_allow_html=True)
        p = pie({"Coding":tot["coding"],"Music":tot["music"],"Other":tot["other"]})
        if p:
            st.plotly_chart(p, use_container_width=True, config={"displayModeBar":False})
        else:
            st.markdown(f'<p style="color:{MUTED};text-align:center;padding:60px 0">No data for this period</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

    with r:
        st.markdown('<div class="chart-box">', unsafe_allow_html=True)
        tl = timeline(acts)
        if tl:
            st.plotly_chart(tl, use_container_width=True, config={"displayModeBar":False})
        else:
            st.markdown(f'<p style="color:{MUTED};text-align:center;padding:60px 0">No timeline data</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

    # ── Daily breakdown ───────────────────────────────────────────────────────
    span = (end-start).days
    if period in ["Last 7 Days","Last 30 Days"] or (period=="Custom" and span>1):
        st.markdown('<div class="sec">📅 Daily Breakdown</div>', unsafe_allow_html=True)
        dd = {"dates":[],"coding":[],"music":[],"other":[]}
        cur = start
        while cur <= end:
            ds = db.get_daily_summary(cur.strftime("%Y-%m-%d"))
            dd["dates"].append(cur.strftime("%b %d"))
            if ds:
                dd["coding"].append(ds[1] or 0)
                dd["music"].append(ds[2]  or 0)
                dd["other"].append(ds[3]  or 0)
            else:
                dd["coding"].append(0); dd["music"].append(0); dd["other"].append(0)
            cur += timedelta(days=1)
        bar = daily_bar(dd)
        if bar:
            st.markdown('<div class="chart-box">', unsafe_allow_html=True)
            st.plotly_chart(bar, use_container_width=True, config={"displayModeBar":False})
            st.markdown('</div>', unsafe_allow_html=True)

    # ── Top apps ──────────────────────────────────────────────────────────────
    st.markdown('<div class="sec">🖥️ Top Applications</div>', unsafe_allow_html=True)
    app_stats = db.get_activity_by_app(
        start_date=start.strftime("%Y-%m-%d"),
        end_date=end.strftime("%Y-%m-%d"))

    if app_stats:
        top = sorted(app_stats, key=lambda x: x[3] or 0, reverse=True)[:10]
        apps_table(top, top[0][3] or 1)
    else:
        st.markdown(f'<p style="color:{MUTED};padding:16px 0">No application data for this period.</p>', unsafe_allow_html=True)

    # ── Weekly stats ──────────────────────────────────────────────────────────
    if (end-start).days >= 6:
        st.markdown('<div class="sec">📊 Weekly Statistics</div>', unsafe_allow_html=True)
        wk = db.get_weekly_summary(end.strftime("%Y-%m-%d"))
        if wk:
            rows = "".join(f"""<tr>
                <td>{row[0]}</td>
                <td class="mono" style="color:{C_CODE}">{fmt(row[1] or 0)}</td>
                <td class="mono" style="color:{C_MUSIC}">{fmt(row[2] or 0)}</td>
                <td class="mono" style="color:{C_OTHER}">{fmt(row[3] or 0)}</td>
                <td class="mono">{fmt((row[1] or 0)+(row[2] or 0)+(row[3] or 0))}</td>
            </tr>""" for row in wk)
            st.markdown(f"""
            <table class="wtbl"><thead><tr>
                <th>Date</th>
                <th style="color:{C_CODE}">⌨ Coding</th>
                <th style="color:{C_MUSIC}">♪ Music</th>
                <th style="color:{C_OTHER}">◈ Other</th>
                <th>Total</th>
            </tr></thead><tbody>{rows}</tbody></table>""", unsafe_allow_html=True)

    # ── Footer ────────────────────────────────────────────────────────────────
    st.markdown(f"""
    <div style="margin-top:48px;padding:16px 0;border-top:1px solid {BORDER};
         display:flex;justify-content:space-between;font-size:12px;color:{MUTED}">
      <span>⚡ Activity Tracker v2.0</span>
      <span>{start} → {end} &nbsp;·&nbsp; {len(acts)} events recorded</span>
    </div>""", unsafe_allow_html=True)


if __name__ == "__main__":
    main()
