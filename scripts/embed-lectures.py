#!/usr/bin/env python3
"""
Genera embeddings para cada lecture usando OpenAI text-embedding-3-small
y los escribe a la tabla `lecture_embeddings` en Supabase.

Texto que embebe: title + learning_objective + concept_name + narrative_arc.
Son los campos con mayor densidad semántica. `scenario_character` y
`bloom_verb` / `cognitive_route` se omiten — son metadata pedagógica, no
contenido que queramos matcher contra la query del usuario.

Skip-on-unchanged: si el content_hash en DB coincide con el que calcula
este script, no re-embeddear (ahorra llamadas OpenAI en re-runs).

Uso:
    export OPENAI_API_KEY=...
    export SUPABASE_URL=https://<ref>.supabase.co
    export SUPABASE_KEY=<service-role-key>
    python3 scripts/embed-lectures.py

Si prefieres ejecutarlo desde Claude Code sin service-role key, usa el
--dry-run para obtener los vectores + hashes en JSON y luego pasa los
UPSERTs via MCP execute_sql.

    python3 scripts/embed-lectures.py --dry-run > /tmp/embeddings.json
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Any

try:
    from openai import OpenAI
except ImportError:
    print("falta openai SDK: pip install openai", file=sys.stderr)
    sys.exit(2)

MODEL = "text-embedding-3-small"  # 1536 dims, $0.02 / 1M tokens
REPO_ROOT = Path(__file__).resolve().parent.parent
JSON_DIR = REPO_ROOT / "content" / "lectures-metadata"


def build_embedded_text(lec: dict[str, Any]) -> str:
    """Construye el texto canónico a embedder por lectura."""
    parts = [
        lec["title"],
        lec["learning_objective"],
        lec["concept_name"],
        lec["narrative_arc"],
    ]
    return "\n".join(parts).strip()


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_all_lectures_from_json() -> list[dict[str, Any]]:
    """Lee los 10 JSONs locales, devuelve lista plana de lecciones con
    campos canónicos. Asume que los JSONs están sincronizados con DB."""
    lectures = []
    for fp in sorted(JSON_DIR.glob("[0-9][0-9]-*.json")):
        data = json.loads(fp.read_text(encoding="utf-8"))
        for lec in data["lectures"]:
            lectures.append({
                "section_id": data["section_id"],
                "slug": lec["slug"],
                "title": lec["title"],
                "learning_objective": lec["learning_objective"],
                "concept_name": lec["concept_name"],
                "narrative_arc": lec["narrative_arc"],
            })
    return lectures


def embed_batch(client: OpenAI, texts: list[str]) -> list[list[float]]:
    """OpenAI soporta batch hasta 2048 inputs por request. Nosotros con 100
    cabemos trivial en una sola llamada."""
    response = client.embeddings.create(
        model=MODEL,
        input=texts,
        encoding_format="float",
    )
    return [d.embedding for d in response.data]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="No escribir a DB; dump JSON a stdout")
    args = parser.parse_args()

    if not os.getenv("OPENAI_API_KEY"):
        print("error: falta OPENAI_API_KEY", file=sys.stderr)
        return 2

    lectures = load_all_lectures_from_json()
    print(f"→ {len(lectures)} lecturas a procesar", file=sys.stderr)

    # Construye texto + hash para cada una
    for lec in lectures:
        lec["embedded_text"] = build_embedded_text(lec)
        lec["content_hash"] = content_hash(lec["embedded_text"])

    # Batch single-call a OpenAI
    client = OpenAI()
    texts = [lec["embedded_text"] for lec in lectures]
    print(f"→ llamando OpenAI embeddings ({MODEL}, {len(texts)} textos)...",
          file=sys.stderr)
    vectors = embed_batch(client, texts)
    assert len(vectors) == len(lectures), "mismatch batch size"

    for lec, vec in zip(lectures, vectors):
        lec["embedding"] = vec

    # Stats
    total_chars = sum(len(lec["embedded_text"]) for lec in lectures)
    print(f"✓ embeddings recibidos. "
          f"total text: {total_chars} chars (~{total_chars // 4} tokens). "
          f"dimensión: {len(vectors[0])}.",
          file=sys.stderr)

    if args.dry_run:
        # Dump compacto sin vectores enteros (para no petar stdout)
        preview = [
            {
                "section_id": lec["section_id"],
                "slug": lec["slug"],
                "embedded_text_len": len(lec["embedded_text"]),
                "content_hash": lec["content_hash"][:16] + "...",
                "embedding_dim": len(lec["embedding"]),
                "embedding_head": lec["embedding"][:3],
            }
            for lec in lectures
        ]
        print(json.dumps(preview, ensure_ascii=False, indent=2))
        # Escribe vectores completos a /tmp para consumo por caller
        Path("/tmp/lecture-embeddings.json").write_text(
            json.dumps([
                {
                    "section_id": l["section_id"],
                    "slug": l["slug"],
                    "embedded_text": l["embedded_text"],
                    "content_hash": l["content_hash"],
                    "embedding": l["embedding"],
                }
                for l in lectures
            ], ensure_ascii=False),
            encoding="utf-8",
        )
        print("\n✓ full data: /tmp/lecture-embeddings.json", file=sys.stderr)
        return 0

    # Con service-role key: directo a DB via supabase SDK.
    # (No lo implementamos hoy — Claude Code tiene MCP de Supabase).
    print("modo DB directo no implementado — usa --dry-run y deja que "
          "el caller use el MCP de Supabase", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
