#!/usr/bin/env python3.10
"""
Embed lectures que están en DB pero no tienen embedding (o tienen drift).
Usa el view `lecture_embedding_status` para detectar missing/invalid.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import urllib.request
import urllib.error


def load_env() -> tuple[str, str, str]:
    env = {}
    with open(".env.local") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return (
        env["NEXT_PUBLIC_SUPABASE_URL"],
        env["SUPABASE_SERVICE_ROLE_KEY"],
        env["OPENAI_API_KEY"],
    )


URL, KEY, OPENAI_KEY = load_env()
PG_HEADERS = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}


def api_get(path: str):
    req = urllib.request.Request(f"{URL}/rest/v1/{path}", headers=PG_HEADERS)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def api_upsert(path: str, rows):
    body = json.dumps(rows).encode("utf-8")
    headers = dict(PG_HEADERS)
    headers["Content-Type"] = "application/json"
    headers["Prefer"] = "resolution=merge-duplicates,return=minimal"
    req = urllib.request.Request(
        f"{URL}/rest/v1/{path}", data=body, method="POST", headers=headers
    )
    with urllib.request.urlopen(req) as r:
        return r.status


def openai_embed(texts: list[str]) -> list[list[float]]:
    body = json.dumps({"model": "text-embedding-3-small", "input": texts}).encode("utf-8")
    req = urllib.request.Request(
        "https://api.openai.com/v1/embeddings",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {OPENAI_KEY}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req) as r:
        resp = json.loads(r.read())
    return [d["embedding"] for d in resp["data"]]


def build_text(lec: dict) -> str:
    parts = [
        lec["title"],
        lec.get("learning_objective") or "",
        lec.get("concept_name") or "",
        lec.get("narrative_arc") or "",
    ]
    return "\n".join(p for p in parts if p).strip()


def main() -> int:
    # Which lectures need embedding?
    status = api_get("lecture_embedding_status?status=eq.missing&select=lecture_id")
    missing_ids = [row["lecture_id"] for row in status]
    if not missing_ids:
        print("✓ nada que embeddear")
        return 0

    ids_str = ",".join(missing_ids)
    lectures = api_get(
        f"lectures?id=in.({ids_str})&select=id,slug,title,learning_objective,concept_name,narrative_arc"
    )
    print(f"→ {len(lectures)} lectures sin embedding")

    # Build texts + call OpenAI in one batch
    for lec in lectures:
        lec["embedded_text"] = build_text(lec)
        lec["content_hash"] = hashlib.sha256(
            lec["embedded_text"].encode("utf-8")
        ).hexdigest()
        print(f"  · {lec['slug']}  ({len(lec['embedded_text'])} chars)")

    texts = [lec["embedded_text"] for lec in lectures]
    vectors = openai_embed(texts)
    assert len(vectors) == len(lectures)

    rows = [
        {
            "lecture_id": lec["id"],
            "embedding": vec,
            "model": "text-embedding-3-small",
            "embedded_text": lec["embedded_text"],
            "content_hash": lec["content_hash"],
        }
        for lec, vec in zip(lectures, vectors)
    ]
    api_upsert("lecture_embeddings", rows)
    print(f"✓ {len(rows)} embeddings upserted")
    return 0


if __name__ == "__main__":
    sys.exit(main())
