#!/usr/bin/env python3
"""
Genera metadata pedagógica de lectures por sección usando Claude API.

Usa prompt caching (cache_control: ephemeral) con METODOLOGIA.md + LESSONS_v1.md
+ roster + instrucciones como system prompt cacheable. Segundo llamado en
la misma ventana de 5 min abarata ~90% del input.

Extended thinking activo automáticamente para secciones cognitivamente
ambiguas (asistentes, bases de datos, APIs/MCPs).

Output: JSON estructurado vía tool use (emit_section_metadata).

Uso:
  python3 scripts/generate-lecture-metadata.py <section_id>
  python3 scripts/generate-lecture-metadata.py 1      # introducción
  python3 scripts/generate-lecture-metadata.py 2      # fundamentos

Escribe a: content/lectures-metadata/NN-<slug>.json
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("falta anthropic SDK: pip install anthropic", file=sys.stderr)
    sys.exit(2)

# ============================================================================
# Config
# ============================================================================

REPO_ROOT = Path(__file__).resolve().parent.parent
METODOLOGIA_PATH = REPO_ROOT / "docs" / "METODOLOGIA.md"
LESSONS_V1_PATH = REPO_ROOT / "docs" / "LESSONS_v1.md"
OUTPUT_DIR = REPO_ROOT / "content" / "lectures-metadata"

MODEL = "claude-sonnet-4-5-20250929"
MAX_TOKENS = 8000
EXTENDED_THINKING_SECTIONS = {3, 6, 7}  # cognitivamente ambiguas

# Secciones (espejo de LESSONS_v1.md + DB). slug es para el nombre del archivo.
SECTIONS = {
    1: ("introduccion", "introducción"),
    2: ("fundamentos", "fundamentos"),
    3: ("asistentes", "asistentes"),
    4: ("contenido", "contenido"),
    5: ("automatizacion", "automatización"),
    6: ("bases-de-datos", "bases de datos"),
    7: ("apis-mcps-skills", "APIs, MCPs y skills"),
    8: ("agentes", "agentes"),
    9: ("vibe-coding", "vibe coding"),
    10: ("implementacion", "implementación"),
}


# ============================================================================
# Tool schema (forzar output estructurado)
# ============================================================================

EMIT_TOOL = {
    "name": "emit_section_metadata",
    "description": (
        "Emite la metadata pedagógica para todas las lecciones de una sección. "
        "Llamar una sola vez con el array completo de lecciones."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "lectures": {
                "type": "array",
                "description": "Una entrada por lección, en orden de display_order.",
                "items": {
                    "type": "object",
                    "properties": {
                        "slug": {
                            "type": "string",
                            "description": (
                                "slug de la lección (coincide con el que ya "
                                "existe en DB)"
                            ),
                        },
                        "title": {
                            "type": "string",
                            "description": "título de la lección tal como aparece en LESSONS_v1.md",
                        },
                        "learning_objective": {
                            "type": "string",
                            "description": (
                                "Frase en infinitivo, minúsculas, sin punto final. "
                                "Empieza con un verbo Bloom compatible con bloom_verb. "
                                "20-180 chars. Ej: 'explicar por qué un LLM puede "
                                "inventar datos privados'."
                            ),
                        },
                        "bloom_verb": {
                            "type": "string",
                            "enum": ["recordar", "entender", "aplicar",
                                     "analizar", "evaluar", "crear"],
                            "description": "Categoría Bloom dominante.",
                        },
                        "cognitive_route": {
                            "type": "string",
                            "enum": ["conceptual", "procedimental", "mixta"],
                            "description": (
                                "Derivada de bloom_verb: recordar/entender→conceptual, "
                                "aplicar/analizar→procedimental, evaluar/crear→mixta. "
                                "Usa test de éxito (§2.3) como tiebreaker."
                            ),
                        },
                        "concept_name": {
                            "type": "string",
                            "description": (
                                "Sustantivo o frase sustantiva nombrable, minúsculas, "
                                "2-60 chars, sin puntuación de oración. Ej: "
                                "'alucinación', 'ventana de contexto', 'token'."
                            ),
                        },
                        "narrative_arc": {
                            "type": "string",
                            "description": (
                                "2-4 líneas (80-500 chars) del hook narrativo: "
                                "qué situación arranca la pregunta-trampa del "
                                "Engage. Sin personaje nombrado aquí (el nombre "
                                "va en scenario_character); describe el escenario."
                            ),
                        },
                        "scenario_character": {
                            "type": "string",
                            "description": (
                                "Nombre del roster de 30 que protagoniza el Engage. "
                                "Elige el que embone orgánicamente con el escenario "
                                "de la lección (oficio, edad, situación). Rota para "
                                "no repetir 3 veces consecutivas en la sección."
                            ),
                        },
                    },
                    "required": [
                        "slug", "title", "learning_objective", "bloom_verb",
                        "cognitive_route", "concept_name", "narrative_arc",
                        "scenario_character",
                    ],
                },
            },
        },
        "required": ["lectures"],
    },
}


# ============================================================================
# Prompt construction
# ============================================================================

SYSTEM_TEMPLATE = """Eres un diseñador pedagógico de Itera, una plataforma de educación \
sobre AI para audiencia no-técnica en LATAM. Tu tarea es llenar la metadata \
pedagógica de las lecciones de una sección antes de que se generen los slides.

Conoces el contrato pedagógico al detalle. Siempre respetas:
- Títulos en minúsculas (excepto nombres propios y siglas técnicas)
- Audiencia no-técnica LATAM: test "¿lo entendería alguien de 55 años que jamás programó?"
- Escenarios evergreen, fun, universales — nunca médicos, financieros íntimos ni personales
- Roster de 30 nombres solamente (no inventar)

Para cada lección emites 6 campos mediante el tool `emit_section_metadata`:

1. **learning_objective** — frase en infinitivo, minúsculas, 20-180 chars, SIN punto final. \
Empieza con verbo compatible con bloom_verb.

2. **bloom_verb** — una categoría exacta de Bloom: recordar, entender, aplicar, analizar, \
evaluar, crear.

3. **cognitive_route** — conceptual (recordar/entender), procedimental (aplicar/analizar), \
o mixta (evaluar/crear). Aplica el test de éxito como tiebreaker: si al terminar la \
lección el usuario debe explicar/diagnosticar/reconocer → conceptual; si debe producir/\
arreglar/secuenciar/decidir → procedimental.

4. **concept_name** — sustantivo o frase sustantiva nombrable, minúsculas, 2-60 chars, \
sin puntuación. Ej: "alucinación", "ventana de contexto", "token", "embedding".

5. **narrative_arc** — 2-4 líneas (80-500 chars) del hook narrativo para el Engage de \
la lección. Describe la situación cotidiana + misconception común + revelación del \
mecanismo real que la lección nombrará. NO nombres al personaje aquí (va aparte).

6. **scenario_character** — un nombre exacto del roster. Elige el que embone con el \
oficio/edad/situación del escenario. Evita repeticiones en 3 lecciones consecutivas.

Reglas duras que valida el lint:
- bloom_verb ↔ cognitive_route coherentes (recordar/entender→conceptual, etc.)
- learning_objective empieza con verbo compatible con bloom_verb
- scenario_character ∈ roster de 30
- concept_name únicos dentro de la sección
- Ningún nombre del roster en 3 lecciones consecutivas

================================================================
CONTRATO PEDAGÓGICO COMPLETO (METODOLOGIA.md v0.10)
================================================================

{METODOLOGIA}

================================================================
OUTLINE FIRMADO DEL CURSO (LESSONS_v1.md)
================================================================

{LESSONS_V1}

================================================================
ROSTER DE 30 NOMBRES (copia exacta, no inventar variantes)
================================================================

María, Diego, Lucía, Tomás, Paola, Rodrigo, Sofía, Andrés, Valeria, Jorge, \
Ana, Carlos, Mariana, Pablo, Sebastián, Camila, Fernanda, Luis, Renata, \
Emilio, Daniela, Gabriel, Natalia, Ricardo, Ximena, Javier, Isabella, \
Mauricio, Alejandra, Samuel.
"""

USER_TEMPLATE = """Genera la metadata pedagógica para TODAS las lecciones de esta sección:

**Sección {section_id}: {section_display}**

Lecciones (en orden):
{lecture_list}

Antes de emitir, valida internamente:
1. ¿La distribución de bloom_verb tiene variedad razonable? (no >80% en una sola categoría)
2. ¿Los concept_name son únicos dentro de esta sección?
3. ¿Ningún personaje se repite en 3 lecciones consecutivas?
4. ¿Cada learning_objective pasa el test de éxito para su cognitive_route?

Cuando estés seguro, llama a emit_section_metadata una sola vez con todas las lecciones \
en el orden dado."""


def _load_cached_system() -> list[dict]:
    """Construye el system prompt con cache_control ephemeral."""
    metodologia = METODOLOGIA_PATH.read_text(encoding="utf-8")
    lessons_v1 = LESSONS_V1_PATH.read_text(encoding="utf-8")

    system_text = SYSTEM_TEMPLATE.format(
        METODOLOGIA=metodologia,
        LESSONS_V1=lessons_v1,
    )

    # Un solo bloque, cacheado. El cache key se deriva del contenido.
    return [
        {
            "type": "text",
            "text": system_text,
            "cache_control": {"type": "ephemeral"},
        }
    ]


# ============================================================================
# DB fetch: títulos y slugs actuales de la sección
# ============================================================================

def _fetch_lectures_from_json_fallback(section_id: int) -> list[dict]:
    """Si no hay credenciales de Supabase a la mano, parseamos LESSONS_v1.md
    para extraer títulos. Este es plan B — lo normal es tomarlos de DB via MCP
    (llamado desde Claude Code, no desde este script)."""
    raise NotImplementedError(
        "Este script espera que el caller provea el input como JSON en stdin "
        "o como argumento. Para uso típico, llamar desde Claude Code pasando "
        "los títulos ya leídos de Supabase."
    )


# ============================================================================
# Main
# ============================================================================

def generate_for_section(section_id: int, lectures_input: list[dict],
                         dry_run: bool = False) -> dict:
    """lectures_input: lista de {"slug": ..., "title": ..., "display_order": ...}
    leídos de la tabla lectures (el caller las pasa ya listas)."""
    if section_id not in SECTIONS:
        raise ValueError(f"section_id inválido: {section_id}")

    slug, display_name = SECTIONS[section_id]

    lecture_list_lines = [
        f"  {lec['display_order']}. {lec['title']}  (slug: {lec['slug']})"
        for lec in lectures_input
    ]
    user_prompt = USER_TEMPLATE.format(
        section_id=section_id,
        section_display=display_name,
        lecture_list="\n".join(lecture_list_lines),
    )

    if dry_run:
        print("=== DRY RUN — system cached + user prompt ===")
        print(f"model: {MODEL}")
        print(f"extended thinking: {section_id in EXTENDED_THINKING_SECTIONS}")
        print(f"lectures: {len(lectures_input)}")
        print(user_prompt)
        return {"dry_run": True}

    client = anthropic.Anthropic()  # key desde env var ANTHROPIC_API_KEY

    kwargs: dict = {
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "system": _load_cached_system(),
        "tools": [EMIT_TOOL],
        "tool_choice": {"type": "tool", "name": "emit_section_metadata"},
        "messages": [{"role": "user", "content": user_prompt}],
    }

    # Extended thinking para secciones cognitivamente ambiguas
    if section_id in EXTENDED_THINKING_SECTIONS:
        # Extended thinking requiere max_tokens > budget_tokens
        kwargs["thinking"] = {"type": "enabled", "budget_tokens": 4000}
        kwargs["max_tokens"] = 12000
        # Extended thinking + tool_choice forced no siempre es compatible;
        # usamos 'auto' en ese caso
        kwargs["tool_choice"] = {"type": "auto"}

    response = client.messages.create(**kwargs)

    # Extraer el tool_use result
    tool_use_block = None
    for block in response.content:
        if getattr(block, "type", None) == "tool_use" and \
           block.name == "emit_section_metadata":
            tool_use_block = block
            break

    if tool_use_block is None:
        raise RuntimeError(
            f"Claude no llamó emit_section_metadata. "
            f"Stop reason: {response.stop_reason}. "
            f"Content: {response.content[:200]}"
        )

    metadata = tool_use_block.input  # dict con {"lectures": [...]}

    # Anotar usage para diagnóstico
    usage = response.usage
    print(f"\n=== usage ===")
    print(f"  input_tokens:       {getattr(usage, 'input_tokens', '?')}")
    print(f"  cache_creation:     {getattr(usage, 'cache_creation_input_tokens', '?')}")
    print(f"  cache_read:         {getattr(usage, 'cache_read_input_tokens', '?')}")
    print(f"  output_tokens:      {getattr(usage, 'output_tokens', '?')}")

    # Wrap con metadata de sección
    output = {
        "section_id": section_id,
        "section_slug": slug,
        "section_display": display_name,
        "model": MODEL,
        "lectures": metadata.get("lectures", []),
    }

    # Escribir a disco
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f"{section_id:02d}-{slug}.json"
    out_path.write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\n✓ escrito: {out_path.relative_to(REPO_ROOT)}")

    return output


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("uso: generate-lecture-metadata.py <section_id> [--dry-run]",
              file=sys.stderr)
        return 2

    section_id = int(argv[1])
    dry_run = "--dry-run" in argv

    # Input se lee de stdin como JSON (el caller las trae de Supabase)
    if sys.stdin.isatty():
        print("error: pasa las lecciones por stdin como JSON.", file=sys.stderr)
        print('ejemplo: echo \'[{"slug":"...","title":"...","display_order":1}]\' '
              '| python3 scripts/generate-lecture-metadata.py 1', file=sys.stderr)
        return 2

    lectures_input = json.load(sys.stdin)
    result = generate_for_section(section_id, lectures_input, dry_run=dry_run)

    if not dry_run:
        print(f"\n{len(result['lectures'])} lecciones generadas.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
