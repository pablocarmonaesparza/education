#!/usr/bin/env python3.10
"""
Restructuración de DB post-feedback (2026-04):
  1. Drop sección 1 (Introducción) — 2 lectures + 20 slides + 2 embeddings
  2. Split sección 7 (APIs, MCPs y Skills) en:
       - sec 7 → APIs (7 lectures)
       - sec 11 (nueva) → MCPs y Skills (8 lectures)
  3. Renumerar display_order de sections: 2-10 → 1-10 cubriendo nueva sec
  4. +2 lectures nuevas:
       - sec 3 Asistentes L8: "Prompts adaptados por asistente"
       - sec 9 Vibe coding L7: "Revisar código generado antes de aceptar"

Todo via PostgREST con SUPABASE_SERVICE_ROLE_KEY (MCP inestable).
"""
from __future__ import annotations

import json
import sys
import urllib.request
import urllib.error


# ─────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────

def load_env() -> tuple[str, str]:
    env = {}
    with open(".env.local") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"]


URL, KEY = load_env()
HEADERS = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}


def api(method: str, path: str, body=None, return_json=False, prefer=None):
    headers = dict(HEADERS)
    if prefer:
        headers["Prefer"] = prefer
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")
    else:
        data = None
    req = urllib.request.Request(
        f"{URL}/rest/v1/{path}", data=data, method=method, headers=headers
    )
    try:
        with urllib.request.urlopen(req) as r:
            if return_json:
                text = r.read().decode("utf-8")
                return json.loads(text) if text.strip() else None
            return r.status
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")[:500]
        print(f"✗ {method} {path} → HTTP {e.code}: {body}", file=sys.stderr)
        raise


def log(msg: str) -> None:
    print(f"  {msg}")


# ─────────────────────────────────────────────────────────────
# Step 1 — Drop Introducción
# ─────────────────────────────────────────────────────────────

def step_drop_intro():
    print("\n═══ STEP 1 — Drop sección 1 (Introducción) ═══")
    # Check if sec 1 still exists (idempotent)
    sec = api("GET", "sections?id=eq.1&select=id", return_json=True)
    if not sec:
        log("→ sección 1 ya no existe, skip")
        return
    # Get lecture IDs from sec 1
    lectures = api("GET", "lectures?select=id&section_id=eq.1", return_json=True)
    ids = [l["id"] for l in lectures]
    log(f"lectures de sec 1: {len(ids)}")
    if not ids:
        log("ya estaba vacío")
        return

    ids_str = ",".join(ids)

    # Delete embeddings
    api("DELETE", f"lecture_embeddings?lecture_id=in.({ids_str})")
    log(f"✓ embeddings borrados")

    # Delete slides
    api("DELETE", f"slides?lecture_id=in.({ids_str})")
    log(f"✓ slides borrados")

    # Delete lectures
    api("DELETE", "lectures?section_id=eq.1")
    log(f"✓ lectures borradas")

    # Delete section
    api("DELETE", "sections?id=eq.1")
    log(f"✓ sección 1 borrada")


# ─────────────────────────────────────────────────────────────
# Step 2 — Split sec 7 into APIs (sec 7) + MCPs y Skills (sec 11)
# ─────────────────────────────────────────────────────────────

# 8 slugs que van a sección MCPs y Skills (nueva)
MCPS_SKILLS_SLUGS = [
    "que-es-mcp",
    "primer-mcp-server",
    "claude-agent-sdk",
    "anthropic-skills",
    "apify-api",
    "firecrawl",
    "prompt-injection",
    "primera-integracion",
]

# 7 slugs que quedan en APIs (sec 7) con nuevo display_order
APIS_SLUGS_ORDER = [
    ("que-es-una-api", 1),
    ("llamar-modelo-codigo", 2),
    ("clis-ai", 3),
    ("manejar-api-keys", 4),
    ("rate-limits-costos", 5),
    ("errores-fallbacks", 6),
    ("elegir-modelo-app", 7),
]

MCPS_SLUGS_ORDER = [
    ("que-es-mcp", 1),
    ("primer-mcp-server", 2),
    ("claude-agent-sdk", 3),
    ("anthropic-skills", 4),
    ("apify-api", 5),
    ("firecrawl", 6),
    ("prompt-injection", 7),
    ("primera-integracion", 8),
]


def step_split_sec7():
    print("\n═══ STEP 2 — Split sec 7 en APIs + MCPs y Skills ═══")

    # Create new section 11: MCPs y Skills (idempotent)
    existing = api("GET", "sections?id=eq.11&select=id", return_json=True)
    if not existing:
        api(
            "POST",
            "sections",
            body=[{
                "id": 11,
                "slug": "mcps-y-skills",
                "name": "MCPs y Skills",
                "display_name": "MCPs y Skills",
                "display_order": 711,  # temporary; step 3 sets to 7
                "est_lectures": 8,
                "status": "planned",
                "pedagogy": "Conectar AI con apps externas y empaquetar capacidades reutilizables.",
                "learning_arc": "El alumno arma su primer MCP server, usa SDKs de agentes, empaqueta skills y construye una integración real end-to-end. Queda con una pieza técnica funcionando.",
            }],
            prefer="return=minimal",
        )
        log("✓ sección 11 MCPs y Skills creada")
    else:
        log("→ sección 11 ya existe, skip create")

    # Move 8 lectures from sec 7 to sec 11 (with new display_order)
    for slug, new_order in MCPS_SLUGS_ORDER:
        api(
            "PATCH",
            f"lectures?slug=eq.{slug}",
            body={"section_id": 11, "display_order": new_order},
            prefer="return=minimal",
        )
    log(f"✓ {len(MCPS_SLUGS_ORDER)} lectures movidas a sec 11")

    # Renumber display_order of 7 remaining APIs lectures in sec 7
    # Offset each to a UNIQUE temp value first (collision avoidance)
    for i, (slug, _) in enumerate(APIS_SLUGS_ORDER):
        api(
            "PATCH",
            f"lectures?slug=eq.{slug}&section_id=eq.7",
            body={"display_order": 100 + i},
            prefer="return=minimal",
        )
    # Then final renumber
    for slug, new_order in APIS_SLUGS_ORDER:
        api(
            "PATCH",
            f"lectures?slug=eq.{slug}&section_id=eq.7",
            body={"display_order": new_order},
            prefer="return=minimal",
        )
    log(f"✓ {len(APIS_SLUGS_ORDER)} lectures de APIs renumeradas")

    # Rename sec 7: "APIs, MCPs y Skills" → "APIs"
    api(
        "PATCH",
        "sections?id=eq.7",
        body={
            "slug": "apis",
            "name": "APIs",
            "display_name": "APIs",
            "est_lectures": 7,
            "learning_arc": "El alumno pasa de usar AI en una interfaz web a llamarla desde código. Termina con control programático: API keys, rate limits, fallbacks y elección de modelo por tarea.",
        },
        prefer="return=minimal",
    )
    log("✓ sec 7 renombrada a 'APIs'")


# ─────────────────────────────────────────────────────────────
# Step 3 — Renumber section display_order
# ─────────────────────────────────────────────────────────────

SECTION_DISPLAY_ORDER = {
    2: 1,   # Fundamentos
    3: 2,   # Asistentes
    4: 3,   # Contenido
    5: 4,   # Automatización
    6: 5,   # Bases de datos
    7: 6,   # APIs
    11: 7,  # MCPs y Skills
    8: 8,   # Agentes
    9: 9,   # Vibe coding
    10: 10, # Implementación
}


def step_renumber_sections():
    print("\n═══ STEP 3 — Renumerar section display_order ═══")

    # Offset all to +100 first (avoid unique collisions)
    for sid in SECTION_DISPLAY_ORDER:
        api("PATCH", f"sections?id=eq.{sid}", body={"display_order": sid + 100},
            prefer="return=minimal")

    # Then set final values
    for sid, order in SECTION_DISPLAY_ORDER.items():
        api("PATCH", f"sections?id=eq.{sid}", body={"display_order": order},
            prefer="return=minimal")
    log(f"✓ {len(SECTION_DISPLAY_ORDER)} sections renumeradas")


# ─────────────────────────────────────────────────────────────
# Step 4 — Insert 2 new lectures
# ─────────────────────────────────────────────────────────────

def step_insert_new_lectures():
    print("\n═══ STEP 4 — Insertar 2 lectures nuevas ═══")

    # --- Sec 3 (Asistentes): Prompts adaptados por asistente ---
    # Slot 8 (entre "Customizar: GPTs y Projects" y "Qué modelo elegir y cuándo")
    # Unique temp offsets per lecture to avoid UNIQUE collisions
    api("PATCH", "lectures?slug=eq.elegir-modelo&section_id=eq.3",
        body={"display_order": 208}, prefer="return=minimal")
    api("PATCH", "lectures?slug=eq.stack-personal&section_id=eq.3",
        body={"display_order": 209}, prefer="return=minimal")
    # Then settle to final positions
    api("PATCH", "lectures?slug=eq.stack-personal&section_id=eq.3",
        body={"display_order": 10}, prefer="return=minimal")
    api("PATCH", "lectures?slug=eq.elegir-modelo&section_id=eq.3",
        body={"display_order": 9}, prefer="return=minimal")

    # Insert new lecture in sec 3
    api("POST", "lectures", body=[{
        "section_id": 3,
        "slug": "prompts-adaptados-por-asistente",
        "title": "Prompts adaptados por asistente",
        "display_title": "Prompts adaptados por asistente",
        "display_order": 8,
        "learning_objective": "ajustar la estructura y el tono de un prompt según el asistente al que se lo envíes",
        "bloom_verb": "aplicar",
        "cognitive_route": "procedimental",
        "concept_name": "adaptación de prompts por modelo",
        "narrative_arc": "Alguien usa el mismo prompt literal en ChatGPT, Claude y Gemini y se desconcierta porque obtiene tres respuestas con calidad muy distinta. No es que los modelos sean mejores o peores en general — cada uno responde mejor a un estilo de prompt específico. Adaptar el prompt al modelo recupera ese 30% de calidad que estaba perdiendo.",
        "scenario_character": "Ana",
        "est_slides": 10,
        "status": "planned",
        "source": "planned",
    }], prefer="return=minimal")
    log("✓ sec 3 nueva lectura: prompts-adaptados-por-asistente")

    # --- Sec 9 (Vibe coding): Revisar código generado ---
    # Slot 7 (entre "Iterar sobre código con AI" y "Whisper")
    api("PATCH", "lectures?slug=eq.whisper&section_id=eq.9",
        body={"display_order": 207}, prefer="return=minimal")
    api("PATCH", "lectures?slug=eq.primer-mini-app&section_id=eq.9",
        body={"display_order": 208}, prefer="return=minimal")
    api("PATCH", "lectures?slug=eq.primer-mini-app&section_id=eq.9",
        body={"display_order": 9}, prefer="return=minimal")
    api("PATCH", "lectures?slug=eq.whisper&section_id=eq.9",
        body={"display_order": 8}, prefer="return=minimal")

    api("POST", "lectures", body=[{
        "section_id": 9,
        "slug": "revisar-codigo-generado",
        "title": "Revisar código generado antes de aceptar",
        "display_title": "Revisar código generado antes de aceptar",
        "display_order": 7,
        "learning_objective": "aplicar una rutina de revisión al código generado por AI para detectar bugs antes de ejecutar o hacer merge",
        "bloom_verb": "aplicar",
        "cognitive_route": "procedimental",
        "concept_name": "revisión de código generado por AI",
        "narrative_arc": "Alguien acepta todo lo que la AI sugiere sin leerlo a fondo y descubre tarde un bug sutil que rompió producción. El problema no es la AI, es el hábito. Antes de ejecutar cualquier diff generado hay que pasarlo por un checklist rápido: ¿entiendo qué hace?, ¿maneja los casos raros?, ¿hay secretos hardcoded?",
        "scenario_character": "Mauricio",
        "est_slides": 10,
        "status": "planned",
        "source": "planned",
    }], prefer="return=minimal")
    log("✓ sec 9 nueva lectura: revisar-codigo-generado")

    # Update est_lectures on those sections
    api("PATCH", "sections?id=eq.3", body={"est_lectures": 10}, prefer="return=minimal")
    api("PATCH", "sections?id=eq.9", body={"est_lectures": 9}, prefer="return=minimal")
    log("✓ est_lectures actualizado en sec 3 (10) y sec 9 (9)")


# ─────────────────────────────────────────────────────────────
# Step 5 — Verify
# ─────────────────────────────────────────────────────────────

def step_verify():
    print("\n═══ STEP 5 — Verificación ═══")
    sections = api("GET",
        "sections?select=id,slug,name,display_order,est_lectures&order=display_order",
        return_json=True)
    lectures = api("GET", "lectures?select=section_id", return_json=True)
    count_by_sec = {}
    for l in lectures:
        count_by_sec[l["section_id"]] = count_by_sec.get(l["section_id"], 0) + 1

    print()
    print(f"  {'#':<4} {'ID':<4} {'slug':<20} {'name':<24} {'est':<4} {'real'}")
    total = 0
    for s in sections:
        real = count_by_sec.get(s["id"], 0)
        total += real
        print(f"  {s['display_order']:<4} {s['id']:<4} {s['slug']:<20} {s['name']:<24} "
              f"{s['est_lectures']:<4} {real}")
    print(f"\n  TOTAL: {len(sections)} secciones, {total} lectures")


# ─────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    step_drop_intro()
    step_split_sec7()
    step_renumber_sections()
    step_insert_new_lectures()
    step_verify()
