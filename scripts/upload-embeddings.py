#!/usr/bin/env python3.10
"""
Lee /tmp/lecture-embeddings.json y sube los embeddings a Supabase via
PostgREST usando la SUPABASE_SERVICE_ROLE_KEY.

Requiere python 3.10 con urllib (stdlib) o requests. Sin deps.

Uso:
    python3.10 scripts/upload-embeddings.py
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


def fetch_lecture_id_map(url: str, key: str) -> dict[tuple[int, str], str]:
    """Map (section_id, slug) → lecture_id (uuid)."""
    req = urllib.request.Request(
        f"{url}/rest/v1/lectures?select=id,section_id,slug",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
        },
    )
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode("utf-8"))
    return {(row["section_id"], row["slug"]): row["id"] for row in data}


def upsert_embeddings(url: str, key: str, rows: list[dict]) -> None:
    """POST /rest/v1/lecture_embeddings con Prefer: resolution=merge-duplicates."""
    body = json.dumps(rows).encode("utf-8")
    req = urllib.request.Request(
        f"{url}/rest/v1/lecture_embeddings",
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
        print(f"✗ HTTP {e.code}: {e.read().decode('utf-8')[:500]}", file=sys.stderr)
        raise


def main() -> int:
    env = load_env()
    url = env["NEXT_PUBLIC_SUPABASE_URL"]
    key = env["SUPABASE_SERVICE_ROLE_KEY"]

    embeddings = json.load(open("/tmp/lecture-embeddings.json"))
    print(f"→ {len(embeddings)} embeddings en archivo", file=sys.stderr)

    # Map to lecture_ids
    id_map = fetch_lecture_id_map(url, key)
    print(f"→ {len(id_map)} lectures en DB", file=sys.stderr)

    rows = []
    for emb in embeddings:
        k = (emb["section_id"], emb["slug"])
        if k not in id_map:
            print(f"warn: {k} no tiene lecture_id en DB, skip", file=sys.stderr)
            continue
        rows.append({
            "lecture_id": id_map[k],
            "embedding": emb["embedding"],
            "model": "text-embedding-3-small",
            "embedded_text": emb["embedded_text"],
            "content_hash": emb["content_hash"],
        })

    print(f"→ subiendo {len(rows)} en chunks de 20", file=sys.stderr)

    # Chunks de 20 para evitar payloads grandes
    for i in range(0, len(rows), 20):
        chunk = rows[i:i+20]
        upsert_embeddings(url, key, chunk)

    print(f"\n✓ upload completo.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
