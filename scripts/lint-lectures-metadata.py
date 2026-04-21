#!/usr/bin/env python3
"""
Lint de metadata pedagógica de lectures.

Valida los 6 campos pedagógicos por lección antes de escribir a la tabla
`lectures` en Supabase. Complementa scripts/lint-lessons.py (que valida
slides); este opera un nivel arriba, sobre la lectura.

Campos validados:
  learning_objective    - frase con verbo Bloom en infinitivo, minúsculas
  bloom_verb            - en {recordar, entender, aplicar, analizar, evaluar, crear}
  cognitive_route       - en {conceptual, procedimental, mixta}
  concept_name          - sustantivo nombrable, minúsculas, 1-60 chars
  narrative_arc         - 80-500 chars (aprox 2-4 líneas)
  scenario_character    - en el ROSTER de 30 nombres (METODOLOGIA §4.1)

Reglas derivadas:
  - bloom_verb coherente con cognitive_route
  - learning_objective empieza con un verbo Bloom compatible con bloom_verb
  - learning_objective no termina con punto (es frase, no oración completa)

Uso:
  python3 scripts/lint-lectures-metadata.py content/lectures-metadata/01-introduccion.json
  python3 scripts/lint-lectures-metadata.py content/lectures-metadata/

Exit: 0 si pasa, 1 si hay violaciones.
"""
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable


# ============================================================================
# Constantes
# ============================================================================

ROSTER = {
    'María', 'Diego', 'Lucía', 'Tomás', 'Paola', 'Rodrigo', 'Sofía', 'Andrés',
    'Valeria', 'Jorge', 'Ana', 'Carlos', 'Mariana', 'Pablo', 'Sebastián',
    'Camila', 'Fernanda', 'Luis', 'Renata', 'Emilio', 'Daniela', 'Gabriel',
    'Natalia', 'Ricardo', 'Ximena', 'Javier', 'Isabella', 'Mauricio',
    'Alejandra', 'Samuel',
}

BLOOM_VERBS = {'recordar', 'entender', 'aplicar', 'analizar', 'evaluar', 'crear'}

COGNITIVE_ROUTES = {'conceptual', 'procedimental', 'mixta'}

# Mapa Bloom category → cognitive_route esperada (METODOLOGIA §2.3)
BLOOM_TO_ROUTE = {
    'recordar': 'conceptual',
    'entender': 'conceptual',
    'aplicar': 'procedimental',
    'analizar': 'procedimental',
    'evaluar': 'mixta',
    'crear': 'mixta',
}

# Sinónimos aceptados por categoría Bloom. El infinitivo en learning_objective
# puede ser cualquiera de estos; el bloom_verb declarado debe ser la categoría.
BLOOM_SYNONYMS: dict[str, set[str]] = {
    'recordar': {
        'definir', 'listar', 'nombrar', 'identificar', 'recordar',
        'reconocer', 'enumerar', 'señalar',
    },
    'entender': {
        'explicar', 'describir', 'resumir', 'interpretar', 'clasificar',
        'comparar', 'entender', 'distinguir', 'contrastar', 'ilustrar',
    },
    'aplicar': {
        'usar', 'aplicar', 'implementar', 'ejecutar', 'resolver',
        'configurar', 'armar', 'crear', 'construir', 'escribir',
        'generar', 'producir',
    },
    'analizar': {
        'analizar', 'distinguir', 'diferenciar', 'comparar', 'examinar',
        'diagnosticar', 'desglosar', 'investigar',
    },
    'evaluar': {
        'evaluar', 'juzgar', 'decidir', 'elegir', 'recomendar', 'validar',
        'priorizar', 'seleccionar', 'criticar', 'justificar',
    },
    'crear': {
        'crear', 'diseñar', 'construir', 'generar', 'producir', 'planear',
        'desarrollar', 'formular', 'componer', 'sintetizar',
    },
}

REQUIRED_FIELDS = [
    'learning_objective', 'bloom_verb', 'cognitive_route',
    'concept_name', 'narrative_arc', 'scenario_character',
]

# Límites de longitud (chars)
NARRATIVE_ARC_MIN = 80
NARRATIVE_ARC_MAX = 500
CONCEPT_NAME_MIN = 2
CONCEPT_NAME_MAX = 60
LEARNING_OBJECTIVE_MIN = 20
LEARNING_OBJECTIVE_MAX = 180


# ============================================================================
# Resultado
# ============================================================================

@dataclass
class Violation:
    lecture_slug: str
    field_name: str
    severity: str  # 'error' | 'warn'
    message: str

    def format(self) -> str:
        tag = 'ERROR' if self.severity == 'error' else 'WARN '
        return f"  [{tag}] {self.lecture_slug}.{self.field_name}: {self.message}"


@dataclass
class LintResult:
    violations: list[Violation] = field(default_factory=list)

    def add(self, slug: str, field_name: str, severity: str, msg: str) -> None:
        self.violations.append(Violation(slug, field_name, severity, msg))

    @property
    def has_errors(self) -> bool:
        return any(v.severity == 'error' for v in self.violations)

    @property
    def errors(self) -> list[Violation]:
        return [v for v in self.violations if v.severity == 'error']

    @property
    def warns(self) -> list[Violation]:
        return [v for v in self.violations if v.severity == 'warn']


# ============================================================================
# Validaciones por campo
# ============================================================================

def _is_lowercase_ok(text: str) -> bool:
    """True si el texto está en minúsculas excepto nombres propios (empiezan
    con mayúscula y están en un allowlist de tokens conocidos)."""
    # Allowlist de tokens que pueden ir con mayúscula: siglas técnicas,
    # nombres de productos/personas.
    allowed_capitalized = {
        'AI', 'LLM', 'API', 'MCP', 'RAG', 'RLS', 'SDK', 'CRM', 'LLMs',
        'APIs', 'MCPs', 'SDKs', 'CRMs', 'GPT', 'GPTs', 'JSON', 'SQL',
        'URL', 'HTTP', 'HTTPS', 'CLI', 'UI', 'UX', 'USD',
        'ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Grok', 'GitHub',
        'Cursor', 'Codex', 'OpenClaw', 'Notion', 'Airtable', 'Supabase',
        'HubSpot', 'Salesforce', 'Apify', 'Firecrawl', 'Browserbase',
        'n8n', 'Make', 'Zapier', 'Slack', 'WhatsApp', 'LinkedIn',
        'Flux', 'Seedance', 'Kling', 'Veo', 'Sora', 'ElevenLabs',
        'Nano', 'Banana', 'Whisper', 'Google', 'Workspace', 'Anthropic',
        'OpenAI', 'Ollama', 'Meta', 'Microsoft', 'DeepSeek', 'Qwen',
        'React', 'Next', 'Postgres', 'Stripe', 'Mercado', 'Pago',
        'Docs', 'Sheets', 'Gmail', 'Drive', 'Calendar', 'Project',
        'Projects', 'Canvas', 'Artifacts', 'Skills', 'Skill',
        'Instagram', 'Facebook', 'TikTok', 'YouTube', 'Discord',
        'Llama', 'Gemma', 'Mistral', 'Stable', 'Diffusion',
        'Runway', 'Midjourney', 'Dall-E', 'DALL-E',
        'Code', 'Agent', 'ReAct', 'Vercel', 'Fly', 'CLIs', 'A2A', 'Git',
        'LATAM', 'ICP', 'Cohere', 'MVP', 'UX', 'DB', 'Twitter', 'X',
        'Model', 'Context', 'Protocol', 'Large', 'Language',
    }
    # Añadir roster
    allowed_capitalized |= ROSTER

    # Capture runs that start with a letter and may include digits/hyphens
    # so tokens like "A2A" or "AI-literate" stay atomic.
    for word in re.findall(
        r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ-]*",
        text,
    ):
        if not word[0].isupper():
            continue
        if word in allowed_capitalized:
            continue
        # Hyphenated compound: each capitalized segment must be in the
        # allowlist ("AI-literate" → "AI" allowed, "literate" lowercase OK).
        if '-' in word:
            segments = word.split('-')
            if all(
                (not seg or not seg[0].isupper() or seg in allowed_capitalized)
                for seg in segments
            ):
                continue
        return False
    return True


def _first_word_lowercase(text: str) -> str | None:
    match = re.match(r"\s*([a-záéíóúüñ]+)", text)
    return match.group(1) if match else None


def _validate_lecture(lec: dict[str, Any], result: LintResult) -> None:
    slug = lec.get('slug') or lec.get('title') or '<unknown>'

    # 1. Campos requeridos presentes
    for fname in REQUIRED_FIELDS:
        value = lec.get(fname)
        if value is None or (isinstance(value, str) and not value.strip()):
            result.add(slug, fname, 'error', 'campo requerido vacío')

    # Si falta algo crítico, aborta validación semántica de esta lectura
    if any(not (lec.get(f) or '').strip() for f in REQUIRED_FIELDS):
        return

    lo = lec['learning_objective'].strip()
    bv = lec['bloom_verb'].strip().lower()
    cr = lec['cognitive_route'].strip().lower()
    cn = lec['concept_name'].strip()
    na = lec['narrative_arc'].strip()
    sc = lec['scenario_character'].strip()

    # 2. bloom_verb ∈ set válido
    if bv not in BLOOM_VERBS:
        result.add(slug, 'bloom_verb', 'error',
                   f"valor '{bv}' no está en {sorted(BLOOM_VERBS)}")

    # 3. cognitive_route ∈ set válido
    if cr not in COGNITIVE_ROUTES:
        result.add(slug, 'cognitive_route', 'error',
                   f"valor '{cr}' no está en {sorted(COGNITIVE_ROUTES)}")

    # 4. bloom_verb ↔ cognitive_route coherentes
    if bv in BLOOM_VERBS and cr in COGNITIVE_ROUTES:
        expected = BLOOM_TO_ROUTE[bv]
        if cr != expected:
            result.add(slug, 'cognitive_route', 'error',
                       f"'{bv}' → esperado '{expected}', got '{cr}' "
                       f"(METODOLOGIA §2.3)")

    # 5. scenario_character ∈ roster
    if sc not in ROSTER:
        result.add(slug, 'scenario_character', 'error',
                   f"'{sc}' no está en el roster de 30 (METODOLOGIA §4.1)")

    # 6. learning_objective — longitud, minúsculas, empieza con infinitivo Bloom
    if len(lo) < LEARNING_OBJECTIVE_MIN:
        result.add(slug, 'learning_objective', 'warn',
                   f"muy corto ({len(lo)} chars, mín {LEARNING_OBJECTIVE_MIN})")
    if len(lo) > LEARNING_OBJECTIVE_MAX:
        result.add(slug, 'learning_objective', 'warn',
                   f"muy largo ({len(lo)} chars, máx {LEARNING_OBJECTIVE_MAX})")
    if lo.endswith('.'):
        result.add(slug, 'learning_objective', 'warn',
                   "termina con punto — debería ser frase infinitiva, no oración")
    if not _is_lowercase_ok(lo):
        result.add(slug, 'learning_objective', 'error',
                   "contiene mayúsculas fuera de nombres propios (regla 1)")

    first = _first_word_lowercase(lo)
    if first is None:
        result.add(slug, 'learning_objective', 'error',
                   "no empieza con verbo en minúsculas")
    elif bv in BLOOM_VERBS:
        allowed = BLOOM_SYNONYMS.get(bv, set())
        if first not in allowed:
            result.add(slug, 'learning_objective', 'error',
                       f"empieza con '{first}' — no compatible con "
                       f"bloom_verb '{bv}'. Sinónimos válidos: "
                       f"{sorted(allowed)[:5]}...")

    # 7. concept_name — longitud, minúsculas, no-oración
    if len(cn) < CONCEPT_NAME_MIN:
        result.add(slug, 'concept_name', 'error',
                   f"muy corto ({len(cn)} chars)")
    if len(cn) > CONCEPT_NAME_MAX:
        result.add(slug, 'concept_name', 'warn',
                   f"muy largo ({len(cn)} chars, ideal ≤ {CONCEPT_NAME_MAX})")
    if '.' in cn or '?' in cn or '!' in cn:
        result.add(slug, 'concept_name', 'error',
                   "contiene puntuación de oración — debe ser sustantivo/frase")
    if not _is_lowercase_ok(cn):
        result.add(slug, 'concept_name', 'error',
                   "contiene mayúsculas fuera de nombres propios (regla 1)")

    # 8. narrative_arc — longitud 2-4 líneas
    if len(na) < NARRATIVE_ARC_MIN:
        result.add(slug, 'narrative_arc', 'warn',
                   f"muy corto ({len(na)} chars, ideal ≥ {NARRATIVE_ARC_MIN})")
    if len(na) > NARRATIVE_ARC_MAX:
        result.add(slug, 'narrative_arc', 'warn',
                   f"muy largo ({len(na)} chars, ideal ≤ {NARRATIVE_ARC_MAX})")


def _cross_validate_section(lectures: list[dict[str, Any]],
                             result: LintResult) -> None:
    """Valida distribuciones dentro de una sección completa."""
    if not lectures:
        return

    # Rotación del roster: ningún nombre debe aparecer en 3 lecciones
    # consecutivas. Si son <3 lecciones, skip.
    if len(lectures) >= 3:
        for i in range(len(lectures) - 2):
            trio = [lectures[j].get('scenario_character') for j in range(i, i + 3)]
            if trio[0] and trio[0] == trio[1] == trio[2]:
                slug = lectures[i + 2].get('slug', '<unknown>')
                result.add(slug, 'scenario_character', 'warn',
                           f"'{trio[0]}' aparece en 3 lecciones consecutivas")

    # concept_name únicos dentro de la sección
    seen_concepts: dict[str, str] = {}
    for lec in lectures:
        cn = (lec.get('concept_name') or '').strip().lower()
        if not cn:
            continue
        if cn in seen_concepts:
            result.add(lec.get('slug', '<unknown>'), 'concept_name', 'warn',
                       f"'{cn}' ya usado por '{seen_concepts[cn]}'")
        else:
            seen_concepts[cn] = lec.get('slug', '<unknown>')

    # Distribución de bloom_verb — alerta si >80% cae en uno solo
    if len(lectures) >= 5:
        verbs = [(lec.get('bloom_verb') or '').lower() for lec in lectures]
        from collections import Counter
        counts = Counter(v for v in verbs if v)
        if counts:
            most_common, count = counts.most_common(1)[0]
            ratio = count / len(lectures)
            if ratio > 0.8:
                result.add('<section>', 'bloom_verb', 'warn',
                           f"'{most_common}' aparece en {count}/{len(lectures)} "
                           f"lecciones ({ratio:.0%}) — sección poco variada")


# ============================================================================
# Entry point
# ============================================================================

def _iter_json_files(path: Path) -> Iterable[Path]:
    if path.is_file():
        yield path
        return
    if path.is_dir():
        for p in sorted(path.glob('*.json')):
            yield p


def _lint_file(path: Path) -> LintResult:
    result = LintResult()
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except json.JSONDecodeError as e:
        result.add(path.name, '<file>', 'error', f"JSON inválido: {e}")
        return result

    lectures = data.get('lectures') if isinstance(data, dict) else data
    if not isinstance(lectures, list):
        result.add(path.name, '<file>', 'error',
                   "formato esperado: dict con 'lectures' o lista de lecciones")
        return result

    for lec in lectures:
        if not isinstance(lec, dict):
            result.add('<?>', '<lecture>', 'error',
                       "cada lectura debe ser un objeto JSON")
            continue
        _validate_lecture(lec, result)

    _cross_validate_section(lectures, result)
    return result


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("uso: lint-lectures-metadata.py <archivo.json | directorio>",
              file=sys.stderr)
        return 2

    target = Path(argv[1])
    if not target.exists():
        print(f"error: no existe {target}", file=sys.stderr)
        return 2

    total = LintResult()
    files_seen = 0
    for fp in _iter_json_files(target):
        files_seen += 1
        print(f"→ {fp}")
        res = _lint_file(fp)
        for v in res.violations:
            print(v.format())
        total.violations.extend(res.violations)

    print()
    if files_seen == 0:
        print("no se encontraron archivos .json", file=sys.stderr)
        return 2

    print(f"{files_seen} archivo(s), "
          f"{len(total.errors)} error(es), {len(total.warns)} warn(s)")

    return 1 if total.has_errors else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
