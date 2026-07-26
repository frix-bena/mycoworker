"""Standalone HTTP server for the Activity Tracker HTML dashboard."""

import json, os, sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime, timedelta
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import ActivityDatabase
from config import MONITOR_INTERVAL

PORT = 8080
HTML_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "index.html")


def fmt(s):
    if not s: return "0m"
    h, r = divmod(int(s), 3600)
    m, sc = divmod(r, 60)
    if h: return f"{h}h {m}m"
    if m: return f"{m}m {sc}s"
    return f"{sc}s"


class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/data":
            self._api(parse_qs(parsed.query))
        else:
            self._html()

    def _html(self):
        with open(HTML_PATH, "rb") as f:
            body = f.read()
        self._respond(200, "text/html; charset=utf-8", body)

    def _api(self, params):
        db = ActivityDatabase()
        end_str   = params.get("end",   [datetime.now().strftime("%Y-%m-%d")])[0]
        start_str = params.get("start", [end_str])[0]

        start_dt = datetime.strptime(start_str, "%Y-%m-%d").date()
        end_dt   = datetime.strptime(end_str,   "%Y-%m-%d").date()

        acts = db.get_activities(start_date=start_str, end_date=end_str)

        # ── summary ──────────────────────────────────────────────────────────
        tot = {"coding": 0, "music": 0, "other": 0}
        for a in acts:
            cat = a[4]
            if cat in tot:
                tot[cat] += a[6] if a[6] else MONITOR_INTERVAL
        tot["total"] = sum(tot.values())

        # ── timeline (hourly buckets) ─────────────────────────────────────────
        hourly = defaultdict(lambda: {"coding": 0, "music": 0, "other": 0})
        for a in acts:
            ts  = str(a[1])[:13]
            cat = a[4]
            if cat in ("coding", "music", "other"):
                hourly[ts][cat] += 1
        timeline = [{"hour": k, **v} for k, v in sorted(hourly.items())]

        # ── apps ─────────────────────────────────────────────────────────────
        raw_apps = db.get_activity_by_app(start_date=start_str, end_date=end_str) or []
        apps = [{"name": r[0], "category": r[1] or "other",
                 "sessions": r[2], "time": r[3] or 0,
                 "timeStr": fmt(r[3] or 0)} for r in raw_apps][:10]

        # ── daily ─────────────────────────────────────────────────────────────
        daily = []
        cur = start_dt
        while cur <= end_dt:
            ds = db.get_daily_summary(cur.strftime("%Y-%m-%d"))
            daily.append({
                "date":   cur.strftime("%b %d"),
                "coding": (ds[1] or 0) if ds else 0,
                "music":  (ds[2] or 0) if ds else 0,
                "other":  (ds[3] or 0) if ds else 0,
            })
            cur += timedelta(days=1)

        # ── weekly ────────────────────────────────────────────────────────────
        weekly = [
            {"date": r[0],
             "coding": r[1] or 0, "music": r[2] or 0, "other": r[3] or 0,
             "codingStr": fmt(r[1] or 0), "musicStr": fmt(r[2] or 0),
             "otherStr":  fmt(r[3] or 0),
             "totalStr":  fmt((r[1] or 0)+(r[2] or 0)+(r[3] or 0))}
            for r in (db.get_weekly_summary(end_str) or [])
        ]

        payload = json.dumps({
            "summary": tot, "timeline": timeline,
            "apps": apps, "daily": daily, "weekly": weekly,
            "start": start_str, "end": end_str,
            "days": (end_dt - start_dt).days + 1,
            "totalStr": fmt(tot["total"]),
            "avgStr":   fmt(tot["total"] // max((end_dt-start_dt).days+1, 1)),
        }).encode()

        self._respond(200, "application/json", payload,
                      extra=[("Access-Control-Allow-Origin","*")])

    def _respond(self, code, ct, body, extra=None):
        self.send_response(code)
        self.send_header("Content-Type", ct)
        self.send_header("Content-Length", str(len(body)))
        for k, v in (extra or []):
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_): pass   # silence access log


if __name__ == "__main__":
    os.makedirs(os.path.dirname(HTML_PATH), exist_ok=True)
    srv = HTTPServer(("localhost", PORT), Handler)
    print(f"\n⚡  Activity Tracker Dashboard")
    print(f"   → http://localhost:{PORT}\n")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
