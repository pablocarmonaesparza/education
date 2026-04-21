#!/usr/bin/env python3.10
"""
Upload slides JSON to Supabase via PostgREST using SUPABASE_SERVICE_ROLE_KEY.

Reads content/lessons/*.json, resolves lecture_id by slug, UPSERTs all
slides for the lesson (on conflict lecture_id + order_in_lecture).
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path


def load_env(path: str = ".env.local") -> dict[str, str]:
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env


def fetch_lecture_id(url: str, key: str, slug: str) -> str | None:
    req = urllib.request.Request(
        f"{url}/rest/v1/lectures?select=id&slug=eq.{slug}",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
        },
    )
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode("utf-8"))
    return data[0]["id"] if data else None


def upsert_slides(url: str, key: str, rows: list[dict]) -> None:
    body = json.dumps(rows).encode("utf-8")
    req = urllib.request.Request(
        f"{url}/rest/v1/slides?on_conflict=lecture_id,order_in_lecture",
        data=body,
        method="POST",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )
    try:
        with urllib.request.urlopen(req) as r:
            print(f"✓ {len(rows)} upserted (status {r.status})")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")[:600]
        print(f"✗ HTTP {e.code}: {body}", file=sys.stderr)
        raise


def main() -> int:
    env = load_env()
    url = env["NEXT_PUBLIC_SUPABASE_URL"]
    key = env["SUPABASE_SERVICE_ROLE_KEY"]

    NON_SCOREABLE = {"concept", "concept-visual", "celebration"}

    for fp in sorted(Path("content/lessons").glob("*.json")):
        data = json.loads(fp.read_text(encoding="utf-8"))
        slug = data["slug"]
        lecture_id = fetch_lecture_id(url, key, slug)
        if not lecture_id:
            print(f"✗ no lecture_id for {slug}", file=sys.stderr)
            continue

        rows = []
        for slide in data["slides"]:
            kind = slide["kind"]
            is_scoreable = kind not in NON_SCOREABLE
            xp = slide["content"].get("xp", 10 if is_scoreable else 0)
            if not is_scoreable:
                xp = 0
            rows.append({
                "lecture_id": lecture_id,
                "order_in_lecture": slide["order_in_lecture"],
                "kind": kind,
                "phase": slide.get("phase"),
                "content": slide["content"],
                "is_scoreable": is_scoreable,
                "xp": xp,
                "source": "ai-generated",
                "status": "drafted",
            })

        print(f"→ {slug}: uploading {len(rows)} slides...")
        upsert_slides(url, key, rows)

    return 0


if __name__ == "__main__":
    sys.exit(main())
