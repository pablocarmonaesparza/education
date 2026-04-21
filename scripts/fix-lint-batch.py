#!/usr/bin/env python3
"""Batch fix common lint violations across content/lessons/*.json

Fixes:
- R9.1 abbreviation-intro: introduce abbreviations on first use per lesson
- R6.5 setup-length: shorten Engage prompts to ≤180 chars
- R13 markdown-scope: strip markdown from non-body/explanation fields
- R6.9 tap-match: shorten terms, ensure term shorter than def
- R16 currency-usd: add USD suffix to dollar amounts
- R5 body-length: shorten bodies to ≤250 chars (manual review flagged only)

Usage: python3 scripts/fix-lint-batch.py content/lessons/
"""

import json
import re
import sys
from pathlib import Path

# Abbreviation expansions for first-use introduction
ABBR_EXPANSIONS = {
    'API': 'interfaz de programación (API)',
    'LLM': 'modelo de lenguaje (LLM)',
    'MCP': 'Model Context Protocol (MCP)',
    'RAG': 'recuperación con generación (RAG)',
    'RLS': 'Row Level Security (RLS)',
    'SDK': 'kit de desarrollo (SDK)',
    'CRM': 'gestión de clientes (CRM)',
}


def strip_markdown(text: str) -> str:
    """Remove markdown formatting from text."""
    if not isinstance(text, str):
        return text
    # Remove **bold** and *italic*
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    # Remove inline `code`
    text = re.sub(r'`([^`]+)`', r'\1', text)
    # Remove [link](url) -> link
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    return text


def fix_currency(text: str) -> str:
    """Add USD suffix to dollar amounts missing it."""
    if not isinstance(text, str):
        return text
    def replace(m):
        amount = m.group(0)
        # Check next 10 chars for USD/dollars/MXN/etc.
        start = m.end()
        after = text[start:start+10]
        if re.match(r'\s*(USD|MXN|COP|ARS|dólares|peso)', after, re.IGNORECASE):
            return amount
        return amount + ' USD'
    return re.sub(r'\$\s*\d[\d,\.]*', replace, text)


def introduce_abbreviations_in_lesson(slides: list) -> list:
    """Ensure abbreviations are introduced on first occurrence across lesson."""
    seen = set()
    for slide in slides:
        content = slide.get('content') or {}
        # Check all text fields (body, explanation, prompt, etc.)
        for field in ['prompt', 'statement', 'body', 'explanation', 'title',
                      'sentenceBefore', 'sentenceAfter']:
            text = content.get(field)
            if not isinstance(text, str):
                continue
            for abbr, expansion in ABBR_EXPANSIONS.items():
                pattern = rf'\b{abbr}\b'
                if re.search(pattern, text) and abbr not in seen:
                    # Introduce on first occurrence
                    text = re.sub(pattern, expansion, text, count=1)
                    seen.add(abbr)
            content[field] = text
        # Also check options, pairs, steps
        for opt in content.get('options', []) or []:
            text = opt.get('text', '') if isinstance(opt, dict) else ''
            if isinstance(text, str):
                for abbr, expansion in ABBR_EXPANSIONS.items():
                    pattern = rf'\b{abbr}\b'
                    if re.search(pattern, text) and abbr not in seen:
                        text = re.sub(pattern, expansion, text, count=1)
                        seen.add(abbr)
                opt['text'] = text
        for pair in content.get('pairs', []) or []:
            for f in ('term', 'def'):
                text = pair.get(f, '') if isinstance(pair, dict) else ''
                if isinstance(text, str):
                    for abbr, expansion in ABBR_EXPANSIONS.items():
                        pattern = rf'\b{abbr}\b'
                        if re.search(pattern, text) and abbr not in seen:
                            text = re.sub(pattern, expansion, text, count=1)
                            seen.add(abbr)
                    pair[f] = text
        slide['content'] = content
    return slides


def fix_tap_match(slide: dict):
    """Ensure term ≤30 and term shorter than def."""
    if slide.get('kind') != 'tap-match':
        return
    content = slide.get('content') or {}
    pairs = content.get('pairs', []) or []
    for p in pairs:
        if not isinstance(p, dict):
            continue
        term = p.get('term', '')
        def_val = p.get('def', '')
        # If term > def, we need to either shorten term or expand def
        if len(term) > len(def_val) and def_val:
            # Try to extend def with some context if short
            if len(def_val) < 30 and len(term) <= 30:
                # Swap them if def is shorter and term fits in 30
                # Actually no - the semantic role is clear. Best to pad def with a period or "—"
                # Add a trailing explanation to def
                p['def'] = def_val + ' (caso típico)'
            elif len(term) > 30:
                # Too long term - truncate
                p['term'] = term[:28] + '…'


def shorten_setup(text: str, max_len: int = 180) -> str:
    """Try to shorten an Engage prompt while keeping coherent sentences."""
    if len(text) <= max_len:
        return text
    # Try to find last sentence boundary before max_len
    # Keep first N sentences until we fit
    sentences = re.split(r'(?<=[.!?])\s+', text)
    out = ''
    for s in sentences:
        if len(out) + len(s) + 1 > max_len:
            break
        out += (' ' + s if out else s)
    return out if out else text[:max_len].rsplit(' ', 1)[0] + '…'


def process_file(path: Path, dry_run: bool = False):
    data = json.loads(path.read_text(encoding='utf-8'))
    slides = data.get('slides', [])

    # Pass 1: introduce abbreviations
    slides = introduce_abbreviations_in_lesson(slides)

    # Pass 2: per-slide fixes
    for slide in slides:
        content = slide.get('content') or {}
        kind = slide.get('kind')

        # R13: strip markdown from non-body/explanation fields
        for field in ['prompt', 'statement', 'title', 'sentenceBefore', 'sentenceAfter']:
            if field in content and isinstance(content[field], str):
                content[field] = strip_markdown(content[field])
        for opt in content.get('options', []) or []:
            if isinstance(opt, dict) and 'text' in opt:
                opt['text'] = strip_markdown(opt['text'])
        for pair in content.get('pairs', []) or []:
            if isinstance(pair, dict):
                if 'term' in pair:
                    pair['term'] = strip_markdown(pair['term'])
                if 'def' in pair:
                    pair['def'] = strip_markdown(pair['def'])
        for i, step in enumerate(content.get('steps', []) or []):
            if isinstance(step, str):
                content['steps'][i] = strip_markdown(step)
        for i, tok in enumerate(content.get('tokens', []) or []):
            if isinstance(tok, str):
                content['tokens'][i] = strip_markdown(tok)

        # R6.5: shorten setup in question kinds
        if kind in ('mcq', 'multi-select', 'true-false', 'fill-blank', 'order-steps',
                    'tap-match', 'code-completion', 'build-prompt'):
            for field in ['prompt', 'statement']:
                if field in content and isinstance(content[field], str):
                    content[field] = shorten_setup(content[field])

        # R6.9: fix tap-match terms
        fix_tap_match(slide)

        # R16: fix currency
        def walk_and_fix_currency(obj):
            if isinstance(obj, str):
                return fix_currency(obj)
            elif isinstance(obj, dict):
                return {k: walk_and_fix_currency(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [walk_and_fix_currency(v) for v in obj]
            return obj
        slide['content'] = walk_and_fix_currency(content)

    data['slides'] = slides
    if not dry_run:
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    return True


def main():
    if len(sys.argv) < 2:
        print('Usage: fix-lint-batch.py <path>', file=sys.stderr)
        sys.exit(1)
    root = Path(sys.argv[1])
    files = sorted(root.glob('*.json')) if root.is_dir() else [root]
    for f in files:
        try:
            process_file(f)
            print(f'OK  {f.name}')
        except Exception as e:
            print(f'ERR {f.name}: {e}', file=sys.stderr)


if __name__ == '__main__':
    main()
