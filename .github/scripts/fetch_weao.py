#!/usr/bin/env python3
"""Fetch executor status from the WEAO API and write weao.json at repo root.

WEAO (weao.xyz) has no CORS headers, so the browser can't call it directly.
This runs in CI on a schedule, fetches the data server-side, and writes a
trimmed snapshot the site can read same-origin.

"updateStatus" true == the executor is working on the current Roblox version
(what we surface as "online" / "updated").
"""
import json
import urllib.request
import datetime

API = "https://weao.xyz/api/status/exploits"
VER_API = "https://weao.xyz/api/versions/current"
UA = "WEAO-3PService"  # WEAO expects a custom user agent

# executors shown on the site (matched case-insensitively by title).
# for names with multiple platform entries, prefer this platform.
WANTED = {
    "potassium": None,
    "wave": None,
    "seliware": None,
    "synapse z": None,
    "matcha": None,
    "volt": None,
    "xeno": None,
    "solara": None,
    "delta": "Android",
}


def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def main():
    exploits = get_json(API)
    try:
        ver = get_json(VER_API)
        rbx = ver.get("Windows") or ver.get("version") or ""
    except Exception:
        rbx = ""

    picked = {}
    for e in exploits:
        title = (e.get("title") or "").strip()
        key = title.lower()
        if key not in WANTED:
            continue
        pref = WANTED[key]
        # if a platform is preferred, only take that one (or first if none seen yet)
        if key in picked and pref and e.get("platform") != pref:
            continue
        if key in picked and not (pref and e.get("platform") == pref):
            continue
        picked[key] = {
            "title": title,
            "updateStatus": bool(e.get("updateStatus")),
            "detected": bool(e.get("detected")),
            "uncPercentage": e.get("uncPercentage"),
            "suncPercentage": e.get("suncPercentage"),
            "platform": e.get("platform"),
            "version": e.get("version"),
            "free": bool(e.get("free")),
            "updatedDate": e.get("updatedDate"),
            "website": e.get("websitelink"),
        }

    out = {
        "fetched": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "robloxVersion": rbx,
        "exploits": picked,
    }
    with open("weao.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print(f"wrote weao.json with {len(picked)} executors, roblox {rbx}")


if __name__ == "__main__":
    main()
