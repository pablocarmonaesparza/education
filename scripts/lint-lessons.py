#!/usr/bin/env python3
"""
Lint de lecciones Itera.

Valida las reglas automatizables de docs/METODOLOGIA.md sobre un JSON
que contiene 1+ lecciones con sus slides. Funciona offline (sin DB viva).

Reglas validadas (marcadas ✅ en METODOLOGIA §6):
  1  — títulos en minúsculas (excepto nombres propios del allowlist)
  5  — body concept ≤ 250 chars / ≤ 45 palabras sin bullets
  6  — body concept ≤ 400 chars si tiene bullets
  6.5 — setup de preguntas ≤ 180 chars (prompt / statement)
  6.6 — no personajes del roster en slides concept/concept-visual
  6.8 — mayúscula inicial consistente (pairs, steps, options, tokens)
  6.9 — tap-match: term ≤ 30 chars, def ≤ 80 chars
  9.1 — abreviaciones técnicas (API/LLM/MCP/RAG/RLS/SDK/CRM) introducidas
        antes de primer uso en la lección
  13  — markdown inline (*…*, **…**) solo en body/explanation, no en
        title/prompt/statement/options/pairs/steps/tokens/sentenceBefore/After
  16  — monto monetario siempre con sufijo USD (nunca $ suelto)

Reglas NO automatizadas (requieren juicio — rubric humano):
  2, 3, 4, 7, 8, 9, 10, 11, 12, 14, 15 y noun-check.

Uso:
  python3 scripts/lint-lessons.py path/to/lessons.json
  python3 scripts/lint-lessons.py path/to/directory-with-lesson-jsons/

Input format esperado:
  Archivo o lista de lecciones JSON. Cada lección:
  {
    "id": "...",                          # opcional
    "section_id": 2,                      # opcional
    "slug": "que-es-ai",                  # opcional
    "title": "qué es AI",
    "slides": [
      { "order_in_lecture": 1, "kind": "mcq", "content": {...} },
      { "order_in_lecture": 2, "kind": "concept", "content": {...} },
      ...
    ]
  }

Exit code:
  0 si no hay violaciones.
  1 si hay al menos una violación.
"""
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable


# ============================================================================
# Constantes — allowlists, límites, patrones
# ============================================================================

# Roster de nombres (§4.1). Si aparece alguno de estos en un concept slide,
# viola regla 6.6.
ROSTER = {
    'María', 'Diego', 'Lucía', 'Tomás', 'Paola', 'Rodrigo', 'Sofía', 'Andrés',
    'Valeria', 'Jorge', 'Ana', 'Carlos', 'Mariana', 'Pablo', 'Sebastián',
    'Camila', 'Fernanda', 'Luis', 'Renata', 'Emilio', 'Daniela', 'Gabriel',
    'Natalia', 'Ricardo', 'Ximena', 'Javier', 'Isabella', 'Mauricio',
    'Alejandra', 'Samuel',
}

# Abreviaciones técnicas cuya primera ocurrencia debe venir acompañada de
# una intro en palabras llanas. Claves = abreviación; valor = regex que
# detecta la intro cerca (regla 9.1).
ABBREVIATIONS = {
    'API': r'(interfaz|manera programática|conectar.*programa|app.*habl[ae])',
    'LLM': r'(modelo.*lenguaje|Large Language|predice.*palabra)',
    'MCP': r'(Model Context Protocol|protocolo.*conectar)',
    'RAG': r'(Retrieval|recuperación|consultar.*base)',
    'RLS': r'(Row Level|nivel de fila|filtra.*filas)',
    'SDK': r'(Software Development|kit.*desarrollo|biblioteca)',
    'CRM': r'(Customer Relationship|gestión.*clientes|relaciones con clientes)',
}

# Palabras que SIEMPRE pueden empezar con mayúscula en títulos (nombres
# propios comunes). La regla 1 dice "títulos en minúsculas excepto nombres
# propios"; el allowlist ayuda a no flaggear falsos positivos.
TITLE_PROPER_NOUNS = {
    # Acrónimos que siempre van uppercase
    'API', 'APIs', 'LLM', 'LLMs', 'MCP', 'MCPs', 'RAG', 'RLS', 'SDK', 'CRM',
    'CRMs', 'AI', 'SQL', 'IDE', 'CLI', 'UI', 'UX',
    # Productos/marcas
    'ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Grok', 'OpenAI', 'Anthropic',
    'Google', 'Microsoft', 'Meta', 'xAI', 'DeepSeek', 'Qwen', 'Gemma', 'Llama',
    'Flux', 'Kling', 'Seedance', 'Veo', 'Sora', 'ElevenLabs', 'Runway',
    'Nano', 'Banana',
    'Supabase', 'Notion', 'Airtable', 'HubSpot', 'Salesforce',
    'Apify', 'Firecrawl', 'Browserbase',
    'Slack', 'LinkedIn', 'Discord', 'TikTok', 'WhatsApp', 'Telegram',
    'Cursor', 'Codex', 'Lovable', 'GitHub', 'Vercel', 'Netlify',
    'OpenClaw', 'LangSmith', 'Braintrust', 'Promptfoo',
    'n8n', 'Make', 'Zapier',
    'Remotion', 'Shotstack', 'Creatomate',
    'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js',
    # LATAM / regionales
    'LATAM', 'México', 'Hawaii', 'Pujol',
}

# Campos donde el markdown NO se renderiza (regla 13). Si aparece *…* o
# **…** aquí, violación.
FIELDS_NO_MARKDOWN = {
    'title', 'prompt', 'statement', 'sentenceBefore', 'sentenceAfter',
    # options[].text, pairs[].term/def, steps[], tokens[] también cuentan —
    # se revisan por separado en check_markdown_scope()
}

# Kinds que son puramente explicativas (no scoreables) — aplica regla 6.6
EXPLANATORY_KINDS = {'concept', 'concept-visual', 'celebration'}

# Kinds que son preguntas con setup — aplica regla 6.5
QUESTION_KINDS = {'mcq', 'multi-select', 'true-false', 'fill-blank'}


# ============================================================================
# Modelos
# ============================================================================

@dataclass
class Violation:
    lecture_slug: str
    slide_order: int | None
    kind: str | None
    rule: str
    detail: str
    excerpt: str = ''

    def format(self) -> str:
        loc = f"{self.lecture_slug}"
        if self.slide_order is not None:
            loc += f"/s{self.slide_order}"
        if self.kind:
            loc += f" [{self.kind}]"
        head = f"[FAIL] {loc:<40} {self.rule}"
        body = f"  {self.detail}"
        if self.excerpt:
            body += f"\n  > {self.excerpt}"
        return f"{head}\n{body}"


@dataclass
class LintResult:
    violations: list[Violation] = field(default_factory=list)
    lectures_checked: int = 0
    slides_checked: int = 0

    @property
    def passed(self) -> bool:
        return len(self.violations) == 0


# ============================================================================
# Helpers
# ============================================================================

def find_roster_in(text: str) -> list[str]:
    if not text:
        return []
    return [n for n in ROSTER if re.search(r'\b' + re.escape(n) + r'\b', text)]


def has_markdown(text: str) -> bool:
    if not isinstance(text, str):
        return False
    return bool(re.search(r'\*\*[^*]+\*\*|\*[^*\n]+\*', text))


def has_bullets(body: str) -> bool:
    if not isinstance(body, str):
        return False
    # Bullets: `-`, `*`, `•` o `1.`, `2.` al inicio de línea.
    return bool(re.search(r'(^|\n)(\s*)([-•*]|\d+\.)\s', body))


def word_count(text: str) -> int:
    if not isinstance(text, str):
        return 0
    return len(re.findall(r'\S+', text))


def first_letter_is_lower(text: str, proper_nouns: set[str]) -> bool:
    """True si el primer caracter alfabético es minúscula o si la primera
    palabra está en proper_nouns."""
    if not isinstance(text, str) or not text.strip():
        return True
    stripped = text.strip()
    # Check first word against allowlist. Strip trailing punctuation
    # (coma, punto, dos puntos, etc.) para que "APIs," match con "APIs".
    first_word_raw = re.match(r'^([^\s]+)', stripped)
    if first_word_raw:
        first_word = first_word_raw.group(1).rstrip(',.;:!?')
        if first_word in proper_nouns:
            return True
    # Find first alphabetic char
    for ch in stripped:
        if ch.isalpha():
            return ch.islower()
    return True


def first_alpha_is_upper(text: str) -> bool:
    """True si el primer caracter alfabético es mayúscula."""
    if not isinstance(text, str):
        return False
    for ch in text:
        if ch.isalpha():
            return ch.isupper()
    return True  # sin letras, no flaggear


# ============================================================================
# Reglas individuales
# ============================================================================

def check_title_lowercase(slide: dict, lec_slug: str, out: list[Violation]):
    """Regla 1 — títulos en minúsculas (excepto nombres propios)."""
    content = slide.get('content') or {}
    title = content.get('title', '')
    if not title:
        return
    if not first_letter_is_lower(title, TITLE_PROPER_NOUNS):
        out.append(Violation(
            lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
            'R1 title-lowercase',
            f'title empieza con mayúscula fuera del allowlist',
            excerpt=title[:100],
        ))


def check_body_length(slide: dict, lec_slug: str, out: list[Violation]):
    """Reglas 5 y 6 — body length. 250 sin bullets, 400 con bullets."""
    if slide.get('kind') not in ('concept', 'concept-visual'):
        return
    body = (slide.get('content') or {}).get('body', '')
    if not body:
        return
    bullets = has_bullets(body)
    limit = 400 if bullets else 250
    n = len(body)
    words = word_count(body)
    if n > limit:
        out.append(Violation(
            lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
            f'R{"6" if bullets else "5"} body-length',
            f'body = {n} chars (limit {limit}, bullets={bullets}, palabras={words})',
            excerpt=body[:120] + ('...' if len(body) > 120 else ''),
        ))
    # Regla 5 también dice ≤ 45 palabras
    if not bullets and words > 45:
        out.append(Violation(
            lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
            'R5 body-words',
            f'body = {words} palabras (limit 45 sin bullets)',
            excerpt=body[:120] + ('...' if len(body) > 120 else ''),
        ))


def check_setup_length(slide: dict, lec_slug: str, out: list[Violation]):
    """Regla 6.5 — setup de preguntas ≤ 180 chars."""
    if slide.get('kind') not in QUESTION_KINDS:
        return
    content = slide.get('content') or {}
    setup = content.get('prompt') or content.get('statement') or ''
    if len(setup) > 180:
        out.append(Violation(
            lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
            'R6.5 setup-length',
            f'setup = {len(setup)} chars (limit 180)',
            excerpt=setup[:140] + ('...' if len(setup) > 140 else ''),
        ))


def check_character_in_concept(slide: dict, lec_slug: str, out: list[Violation]):
    """Regla 6.6 — no personajes en concept/concept-visual."""
    if slide.get('kind') not in ('concept', 'concept-visual'):
        return
    content = slide.get('content') or {}
    blob = ' '.join([content.get('title', ''), content.get('body', '')])
    names = find_roster_in(blob)
    if names:
        out.append(Violation(
            lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
            'R6.6 character-in-concept',
            f'personaje(s) en slide explicativo: {", ".join(names)}',
            excerpt=blob[:120] + ('...' if len(blob) > 120 else ''),
        ))


def check_capitalization_consistency(slide: dict, lec_slug: str, out: list[Violation]):
    """Regla 6.8 — mayúscula inicial consistente en valores textuales visibles.
    El espíritu: la columna/lista entera mantiene el mismo estilo sin mezclar.
    Todos uppercase, todos lowercase, o todos non-alpha: pasa.
    Mezclar estilos: fail."""
    content = slide.get('content') or {}

    def style_of(text: str) -> str:
        """'upper', 'lower', o 'non-alpha' según el primer caracter alfabético."""
        if not isinstance(text, str):
            return 'non-alpha'
        for ch in text:
            if ch.isalpha():
                return 'upper' if ch.isupper() else 'lower'
        return 'non-alpha'

    def check_group(values: list[tuple[int, str]], group_label: str):
        """values: lista de (index, text). Flag si hay mezcla de estilos."""
        non_empty = [(i, t) for i, t in values if t]
        if len(non_empty) < 2:
            return
        styles = {style_of(t) for _, t in non_empty}
        if len(styles) > 1:
            # Mezclar 'non-alpha' con 'upper' es OK si los non-alpha llevan
            # uppercase implícito (ej: "$47 al mes" mezclado con "USD anual").
            # Pero 'upper'+'lower' o 'lower'+'non-alpha' son sospechosos.
            # Por simplicidad: flag si hay upper+lower simultáneos.
            if 'upper' in styles and 'lower' in styles:
                sample = ', '.join(f'"{t[:30]}"' for _, t in non_empty[:3])
                out.append(Violation(
                    lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
                    'R6.8 capitalization',
                    f'{group_label}: mezcla de estilos ({", ".join(sorted(styles))})',
                    excerpt=sample,
                ))

    # pairs: term y def como dos grupos distintos (son dos columnas visuales)
    pairs = content.get('pairs', []) or []
    terms = [(i, p.get('term', '')) for i, p in enumerate(pairs) if isinstance(p, dict)]
    defs  = [(i, p.get('def', ''))  for i, p in enumerate(pairs) if isinstance(p, dict)]
    check_group(terms, 'pairs[*].term')
    check_group(defs,  'pairs[*].def')

    # steps, options, tokens
    steps = content.get('steps', []) or []
    check_group(
        [(i, s) for i, s in enumerate(steps) if isinstance(s, str)],
        'steps[*]',
    )

    options = content.get('options', []) or []
    check_group(
        [(i, o.get('text', '')) for i, o in enumerate(options) if isinstance(o, dict)],
        'options[*].text',
    )

    tokens = content.get('tokens', []) or []
    check_group(
        [(i, t) for i, t in enumerate(tokens) if isinstance(t, str)],
        'tokens[*]',
    )


def check_tap_match_lengths(slide: dict, lec_slug: str, out: list[Violation]):
    """Regla 6.9 — en tap-match, term ≤ 30, def ≤ 80."""
    if slide.get('kind') != 'tap-match':
        return
    pairs = (slide.get('content') or {}).get('pairs', []) or []
    for i, p in enumerate(pairs):
        term = p.get('term', '') if isinstance(p, dict) else ''
        def_val = p.get('def', '') if isinstance(p, dict) else ''
        if len(term) > 30:
            out.append(Violation(
                lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
                'R6.9 tap-match-term-length',
                f'pair[{i}].term = {len(term)} chars (limit 30)',
                excerpt=term,
            ))
        if len(def_val) > 80:
            out.append(Violation(
                lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
                'R6.9 tap-match-def-length',
                f'pair[{i}].def = {len(def_val)} chars (limit 80)',
                excerpt=def_val,
            ))
        if term and def_val and len(term) > len(def_val):
            out.append(Violation(
                lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
                'R6.9 tap-match-term-longer-than-def',
                f'pair[{i}].term ({len(term)}) > def ({len(def_val)}); grid 25%/50% rompe alineado',
                excerpt=f'term="{term}" def="{def_val}"',
            ))


def check_markdown_scope(slide: dict, lec_slug: str, out: list[Violation]):
    """Regla 13 — markdown solo en body y explanation. Fuera de ahí, rechazar."""
    content = slide.get('content') or {}

    # Campos escalares
    for f in FIELDS_NO_MARKDOWN:
        val = content.get(f)
        if val and has_markdown(val):
            out.append(Violation(
                lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
                'R13 markdown-scope',
                f'{f} contiene markdown (no se renderiza ahí)',
                excerpt=val[:100],
            ))

    # options[].text
    for i, o in enumerate(content.get('options', []) or []):
        val = o.get('text', '') if isinstance(o, dict) else ''
        if val and has_markdown(val):
            out.append(Violation(
                lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
                'R13 markdown-scope',
                f'options[{i}].text contiene markdown',
                excerpt=val[:100],
            ))

    # pairs[].term, pairs[].def
    for i, p in enumerate(content.get('pairs', []) or []):
        for f in ('term', 'def'):
            val = p.get(f, '') if isinstance(p, dict) else ''
            if val and has_markdown(val):
                out.append(Violation(
                    lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
                    'R13 markdown-scope',
                    f'pairs[{i}].{f} contiene markdown',
                    excerpt=val[:100],
                ))

    # steps[]
    for i, s in enumerate(content.get('steps', []) or []):
        if isinstance(s, str) and has_markdown(s):
            out.append(Violation(
                lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
                'R13 markdown-scope',
                f'steps[{i}] contiene markdown',
                excerpt=s[:100],
            ))

    # tokens[]
    for i, t in enumerate(content.get('tokens', []) or []):
        if isinstance(t, str) and has_markdown(t):
            out.append(Violation(
                lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
                'R13 markdown-scope',
                f'tokens[{i}] contiene markdown',
                excerpt=t[:100],
            ))


def check_currency_usd(slide: dict, lec_slug: str, out: list[Violation]):
    """Regla 16 — montos monetarios siempre con sufijo USD."""
    content = slide.get('content') or {}
    # Recorrer todos los strings del contenido
    def walk(obj: Any, path: str = ''):
        if isinstance(obj, str):
            # Match $123, $ 45, $1,000 etc. NO seguido de USD en los próximos 10 chars
            for m in re.finditer(r'\$\s*\d[\d,\.]*', obj):
                start = m.end()
                after = obj[start:start+10]
                if 'USD' not in after:
                    out.append(Violation(
                        lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
                        'R16 currency-usd',
                        f'monto en {path} sin sufijo USD: "{m.group(0)}"',
                        excerpt=obj[max(0, m.start()-20):m.end()+20],
                    ))
        elif isinstance(obj, dict):
            for k, v in obj.items():
                walk(v, path + f'.{k}' if path else k)
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                walk(v, path + f'[{i}]')

    walk(content)


def check_abbreviations(lecture: dict, out: list[Violation]):
    """Regla 9.1 — abreviaciones introducidas antes de primer uso.
    Se evalúa a nivel de lección (orden de slides importa)."""
    slides = sorted(lecture.get('slides', []), key=lambda s: s.get('order_in_lecture', 999))
    lec_slug = lecture.get('slug', lecture.get('title', 'unknown'))

    seen: set[str] = set()
    for slide in slides:
        # Juntar todo el texto visible del slide
        text_parts = collect_text(slide.get('content') or {})
        text = ' '.join(text_parts)

        for abbr, intro_pat in ABBREVIATIONS.items():
            if abbr in seen:
                continue
            if re.search(r'\b' + abbr + r'\b', text):
                # Primera ocurrencia — verificar si hay intro cerca
                if not re.search(intro_pat, text, re.IGNORECASE):
                    out.append(Violation(
                        lec_slug, slide.get('order_in_lecture'), slide.get('kind'),
                        'R9.1 abbreviation-intro',
                        f'abreviación "{abbr}" usada sin introducción previa',
                        excerpt=text[:180],
                    ))
                seen.add(abbr)


def collect_text(content: dict) -> list[str]:
    """Junta todo el texto visible de un slide para análisis lecture-level."""
    parts: list[str] = []
    for k in ('title', 'body', 'prompt', 'statement', 'explanation',
              'sentenceBefore', 'sentenceAfter'):
        if isinstance(content.get(k), str):
            parts.append(content[k])
    for o in content.get('options', []) or []:
        if isinstance(o, dict) and isinstance(o.get('text'), str):
            parts.append(o['text'])
    for p in content.get('pairs', []) or []:
        if isinstance(p, dict):
            for k in ('term', 'def'):
                if isinstance(p.get(k), str):
                    parts.append(p[k])
    for s in content.get('steps', []) or []:
        if isinstance(s, str):
            parts.append(s)
    for t in content.get('tokens', []) or []:
        if isinstance(t, str):
            parts.append(t)
    return parts


# ============================================================================
# Orquestador
# ============================================================================

SLIDE_CHECKS = [
    check_title_lowercase,
    check_body_length,
    check_setup_length,
    check_character_in_concept,
    check_capitalization_consistency,
    check_tap_match_lengths,
    check_markdown_scope,
    check_currency_usd,
]


def lint_lecture(lecture: dict, result: LintResult):
    lec_slug = lecture.get('slug', lecture.get('title', 'unknown'))
    slides = lecture.get('slides', [])
    result.lectures_checked += 1
    for slide in slides:
        result.slides_checked += 1
        for check in SLIDE_CHECKS:
            check(slide, lec_slug, result.violations)
    # Checks que requieren contexto cross-slide (orden de aparición)
    check_abbreviations(lecture, result.violations)


def load_input(path: Path) -> list[dict]:
    """Carga lecciones desde un archivo JSON o un directorio con JSONs."""
    if path.is_dir():
        lectures: list[dict] = []
        for f in sorted(path.glob('*.json')):
            with f.open() as fp:
                data = json.load(fp)
                if isinstance(data, list):
                    lectures.extend(data)
                else:
                    lectures.append(data)
        return lectures
    with path.open() as fp:
        data = json.load(fp)
        return data if isinstance(data, list) else [data]


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__)
        print(f'\nUso: {argv[0]} path/to/lessons.json')
        return 2

    path = Path(argv[1])
    if not path.exists():
        print(f'Error: no existe {path}', file=sys.stderr)
        return 2

    lectures = load_input(path)
    result = LintResult()
    for lec in lectures:
        lint_lecture(lec, result)

    # Reporte
    print('=' * 60)
    print(f'LINT REPORT — docs/METODOLOGIA.md reglas automatizables')
    print('=' * 60)
    print(f'Lecciones procesadas: {result.lectures_checked}')
    print(f'Slides procesados:    {result.slides_checked}')
    print(f'Violaciones:          {len(result.violations)}')
    print()

    if result.passed:
        print('✅ PASS — sin violaciones automatizables.')
        print('   (Las reglas subjetivas siguen siendo responsabilidad del rubric humano.)')
        return 0

    # Agrupar por regla
    by_rule: dict[str, list[Violation]] = {}
    for v in result.violations:
        by_rule.setdefault(v.rule, []).append(v)

    for rule, vs in sorted(by_rule.items()):
        print(f'--- {rule} ({len(vs)} violación/es) ---')
        for v in vs:
            print(v.format())
            print()

    print('=' * 60)
    print(f'❌ FAIL — {len(result.violations)} violación/es en {result.lectures_checked} lección/es.')
    return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv))
